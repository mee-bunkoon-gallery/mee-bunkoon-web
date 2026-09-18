'use client';

import type { IDelivery } from 'src/types/delivery';

import { useState } from 'react';
import { RiAddLine, RiEyeFill, RiEditLine, RiDeleteBin6Fill } from '@remixicon/react';

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
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { TableNoData, TablePaginationCustom } from 'src/components/table';

import { DELIVERY_STATUS_META, DELIVERY_METHOD_LABEL } from './delivery-status';
import { useDeliveriesPageQuery, useDeleteDeliveryMutation } from './delivery-queries';

// ----------------------------------------------------------------------

export function DeliveryListView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<IDelivery | null>(null);

  const { data, isLoading } = useDeliveriesPageQuery({ page, rowsPerPage });
  const deliveries = data?.deliveries ?? [];
  const total = data?.total ?? 0;

  const deleteMutation = useDeleteDeliveryMutation();

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('ลบเอกสารส่งมอบงานแล้ว');
      if (deliveries.length === 1 && page > 0) {
        setPage(page - 1);
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'ลบไม่สำเร็จ');
    } finally {
      setDeleteTarget(null);
    }
  };

  const notFound = !isLoading && !deliveries.length;

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
          startIcon={<RiAddLine />}
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
                          <RiEyeFill />
                        </IconButton>
                        <IconButton
                          component={RouterLink}
                          href={paths.dashboard.delivery.edit(delivery.id)}
                        >
                          <RiEditLine />
                        </IconButton>
                        <IconButton color="error" onClick={() => setDeleteTarget(delivery)}>
                          <RiDeleteBin6Fill />
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

        <TablePaginationCustom
          page={page}
          count={total}
          rowsPerPage={rowsPerPage}
          onPageChange={(_event, newPage) => setPage(newPage)}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
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
