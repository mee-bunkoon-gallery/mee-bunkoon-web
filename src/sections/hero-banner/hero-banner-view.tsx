'use client';

import type { IHeroBanner } from 'src/types/hero-banner';

import { useState } from 'react';
import { RiAddLine, RiEditLine, RiDeleteBin6Line } from '@remixicon/react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Image } from 'src/components/image';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { TableNoData, TablePaginationCustom } from 'src/components/table';

import { useHeroBannersQuery, useDeleteHeroBannerMutation } from './hero-banner-queries';

export function HeroBannerView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<IHeroBanner | null>(null);
  const { data, isLoading } = useHeroBannersQuery({ page, rowsPerPage });
  const banners = data?.banners ?? [];
  const total = data?.total ?? 0;
  const deleteMutation = useDeleteHeroBannerMutation();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('ลบ Banner แล้ว');
      if (banners.length === 1 && page > 0) setPage(page - 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ลบ Banner ไม่สำเร็จ');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        sx={{ mb: 5 }}
      >
        <Typography variant="h4">แบนเนอร์</Typography>
        <Button
          component={RouterLink}
          href={paths.dashboard.heroBanner.new}
          variant="contained"
          startIcon={<RiAddLine />}
        >
          เพิ่มแบนเนอร์
        </Button>
      </Stack>

      <Card>
        <TableContainer sx={{ overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>ภาพ</TableCell>
                  <TableCell>หัวข้อ</TableCell>
                  <TableCell align="center">ลำดับ</TableCell>
                  <TableCell align="center">สถานะ</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id} hover>
                    <TableCell>
                      <Image
                        src={banner.imageUrl || '/assets/images/empty/default.png'}
                        alt={banner.title}
                        sx={{ width: 120, height: 68, borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{banner.title}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {banner.subtitle || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{banner.displayOrder}</TableCell>
                    <TableCell align="center">
                      <Label color={banner.isActive ? 'success' : 'default'}>
                        {banner.isActive ? 'แสดงผล' : 'ปิดใช้งาน'}
                      </Label>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        component={RouterLink}
                        href={paths.dashboard.heroBanner.edit(banner.id)}
                      >
                        <RiEditLine />
                      </IconButton>
                      <IconButton color="error" onClick={() => setDeleteTarget(banner)}>
                        <RiDeleteBin6Line />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableNoData notFound={!isLoading && !banners.length} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
        <TablePaginationCustom
          page={page}
          count={total}
          rowsPerPage={rowsPerPage}
          onPageChange={(_event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setPage(0);
            setRowsPerPage(Number(event.target.value));
          }}
        />
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="ลบแบนเนอร์"
        content={`ต้องการลบ “${deleteTarget?.title}” ใช่หรือไม่?`}
        action={
          <Button
            variant="contained"
            color="error"
            loading={deleteMutation.isPending}
            onClick={handleDelete}
          >
            ลบ
          </Button>
        }
      />
    </DashboardContent>
  );
}
