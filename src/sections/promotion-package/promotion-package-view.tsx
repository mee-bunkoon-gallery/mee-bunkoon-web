'use client';

import type { IPromotionPackage } from 'src/types/promotion-package';

import { useState, useEffect, useCallback } from 'react';
import {
  RiAddLine,
  RiEditLine,
  RiGiftFill,
  RiSearchLine,
  RiDeleteBin6Line,
  RiCalendarEventFill,
} from '@remixicon/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fBaht } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { getPromotionPackages, deletePromotionPackage } from './promotion-package-api';

export function PromotionPackageView() {
  const [packages, setPackages] = useState<IPromotionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<IPromotionPackage | null>(null);

  const loadPackages = useCallback(async () => {
    try {
      setLoading(true);
      setPackages(await getPromotionPackages(search));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(loadPackages, 350);
    return () => clearTimeout(timer);
  }, [loadPackages]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePromotionPackage(deleteTarget.id);
      toast.success('ลบแพ็กเกจแล้ว');
      setDeleteTarget(null);
      await loadPackages();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ลบไม่สำเร็จ');
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={2}
        sx={{ mb: 5 }}
      >
        <Box>
          <Typography variant="h4">แพ็กเกจ/โปรโมชั่น</Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
            รวมรายการบริการเป็นชุดและกำหนดราคาโปรโมชั่น
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          href={paths.dashboard.promotionPackage.new}
          variant="contained"
          startIcon={<RiAddLine />}
        >
          สร้างแพ็กเกจ
        </Button>
      </Stack>
      <TextField
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="ค้นหาชื่อแพ็กเกจ..."
        sx={{ mb: 3, width: { xs: 1, sm: 360 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <RiSearchLine />
              </InputAdornment>
            ),
          },
        }}
      />
      <Grid container spacing={3}>
        {loading &&
          [1, 2, 3].map((item) => (
            <Grid key={item} size={{ xs: 12, md: 6, lg: 4 }}>
              <Skeleton variant="rounded" height={320} />
            </Grid>
          ))}
        {!loading &&
          packages.map((item) => {
            const normalPrice = item.items.reduce(
              (sum, packageItem) => sum + packageItem.quantity * packageItem.unitPrice,
              0
            );
            return (
              <Grid key={item.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card
                  sx={{
                    p: 3,
                    height: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                  }}
                >
                  <Box
                    sx={{
                      mx: -3,
                      mt: -3,
                      mb: 3,
                      height: 180,
                      display: 'grid',
                      placeItems: 'center',
                      color: 'primary.main',
                      bgcolor: 'primary.lighter',
                      borderRadius: 'inherit',
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundImage: `url(${item.imageUrl || '/assets/images/empty/default.png'})`,
                    }}
                   />
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ minWidth: 0 }}>
                      <Chip
                        size="small"
                        label={item.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        color={item.active ? 'success' : 'default'}
                        variant="soft"
                      />
                      <Typography variant="h6" sx={{ mt: 1.5 }}>
                        {item.name}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        component={RouterLink}
                        href={paths.dashboard.promotionPackage.edit(item.id)}
                      >
                        <RiEditLine />
                      </IconButton>
                      <IconButton color="error" onClick={() => setDeleteTarget(item)}>
                        <RiDeleteBin6Line />
                      </IconButton>
                    </Box>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mt: 1, minHeight: 42 }}
                  >
                    {item.description || 'ไม่มีรายละเอียด'}
                  </Typography>
                  <Stack spacing={1} sx={{ my: 2.5 }}>
                    {item.items.slice(0, 4).map((packageItem) => (
                      <Stack key={packageItem.id} direction="row" justifyContent="space-between">
                        <Typography variant="body2">{packageItem.serviceItem.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          × {packageItem.quantity}
                        </Typography>
                      </Stack>
                    ))}
                    {item.items.length > 4 && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        และอีก {item.items.length - 4} รายการ
                      </Typography>
                    )}
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        ราคาโปรโมชั่น
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'primary.main' }}>
                        {fBaht(item.promotionPrice)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled', textDecoration: 'line-through' }}
                      >
                        {fBaht(normalPrice)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', color: 'success.main' }}
                      >
                        ประหยัด {fBaht(Math.max(normalPrice - item.promotionPrice, 0))}
                      </Typography>
                    </Box>
                  </Stack>
                  {(item.startDate || item.endDate) && (
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', mt: 2, color: 'text.secondary' }}
                    >
                      <Box
                        component={RiCalendarEventFill}
                        width={14}
                        sx={{ mr: 0.5, verticalAlign: 'middle' }}
                      />
                      {item.startDate ? fDate(item.startDate) : 'ไม่กำหนด'} –{' '}
                      {item.endDate ? fDate(item.endDate) : 'ไม่กำหนด'}
                    </Typography>
                  )}
                </Card>
              </Grid>
            );
          })}
      </Grid>
      {!loading && !packages.length && (
        <Box sx={{ py: 12, textAlign: 'center', color: 'text.secondary' }}>
          <RiGiftFill size={72} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            ยังไม่มีแพ็กเกจ/โปรโมชั่น
          </Typography>
          <Typography variant="body2">เริ่มสร้างแพ็กเกจจากรายการบริการที่มีอยู่</Typography>
        </Box>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="ลบแพ็กเกจ"
        content={`ต้องการลบ “${deleteTarget?.name}” ใช่หรือไม่?`}
        action={
          <Button color="error" variant="contained" onClick={confirmDelete}>
            ลบ
          </Button>
        }
      />
    </DashboardContent>
  );
}
