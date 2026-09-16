'use client';

import type { IDelivery } from 'src/types/delivery';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
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

import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { TableNoData } from 'src/components/table';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { getDeliveries, deleteDelivery } from './delivery-api';
import { DELIVERY_STATUS_META, DELIVERY_METHOD_LABEL } from './delivery-status';

// ----------------------------------------------------------------------

export function DeliveryListView() {
  const [deliveries, setDeliveries] = useState<IDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<IDelivery | null>(null);

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDeliveries();
      setDeliveries(data);
    } catch (error) {
      console.error(error);
      toast.error('โหลดข้อมูลเอกสารส่งมอบงานไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteDelivery(deleteTarget.id);
      setDeliveries((prev) => prev.filter((row) => row.id !== deleteTarget.id));
      toast.success('ลบเอกสารส่งมอบงานแล้ว');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'ลบไม่สำเร็จ');
    } finally {
      setDeleteTarget(null);
    }
  };

  const notFound = !loading && !deliveries.length;

  return (
    <DashboardContent maxWidth="xl">
      <Box
        sx={{
          mb: 5,
          gap: 2,
          display: 'flex',
          alignItems: { sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h4">เอกสารส่งมอบงาน</Typography>

        <Button
          component={RouterLink}
          href={paths.dashboard.delivery.new}
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          สร้างเอกสารส่งมอบงาน
        </Button>
      </Box>

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>เลขที่เอกสาร</TableCell>
                  <TableCell>ลูกค้า</TableCell>
                  <TableCell>วันที่ส่งมอบ</TableCell>
                  <TableCell>วิธีส่งมอบ</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {deliveries.map((delivery) => {
                  const statusMeta = DELIVERY_STATUS_META[delivery.status];

                  return (
                    <TableRow key={delivery.id} hover>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          href={paths.dashboard.delivery.details(delivery.id)}
                          color="inherit"
                          variant="subtitle2"
                          underline="always"
                        >
                          {delivery.deliveryNo}
                        </Link>
                      </TableCell>
                      <TableCell>{delivery.customer?.name ?? '-'}</TableCell>
                      <TableCell>{fDate(delivery.deliveryDate)}</TableCell>
                      <TableCell>{DELIVERY_METHOD_LABEL[delivery.deliveryMethod]}</TableCell>
                      <TableCell>
                        <Label variant="soft" color={statusMeta.color}>
                          {statusMeta.label}
                        </Label>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          component={RouterLink}
                          href={paths.dashboard.delivery.details(delivery.id)}
                        >
                          <Iconify icon="solar:eye-bold" />
                        </IconButton>
                        <IconButton
                          component={RouterLink}
                          href={paths.dashboard.delivery.edit(delivery.id)}
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton color="error" onClick={() => setDeleteTarget(delivery)}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="ลบเอกสารส่งมอบงาน"
        content={`ต้องการลบ "${deleteTarget?.deliveryNo}" ใช่หรือไม่?`}
        action={
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            ลบ
          </Button>
        }
      />
    </DashboardContent>
  );
}
