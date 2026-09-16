'use client';

import type { IPayment } from 'src/types/payment';

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
import { fBaht } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { TableNoData } from 'src/components/table';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { getPayments, deletePayment } from './payment-api';
import { PAYMENT_METHOD_LABEL, PAYMENT_PURPOSE_LABEL } from './payment-method';

// ----------------------------------------------------------------------

export function PaymentListView() {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<IPayment | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPayments();
      setPayments(data);
    } catch (error) {
      console.error(error);
      toast.error('โหลดข้อมูลใบเสร็จรับเงินไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deletePayment(deleteTarget.id);
      setPayments((prev) => prev.filter((row) => row.id !== deleteTarget.id));
      toast.success('ลบใบเสร็จรับเงินแล้ว');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'ลบไม่สำเร็จ');
    } finally {
      setDeleteTarget(null);
    }
  };

  const notFound = !loading && !payments.length;

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
        <Typography variant="h4">ใบเสร็จรับเงิน</Typography>

        <Button
          component={RouterLink}
          href={paths.dashboard.payment.new}
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          ออกใบเสร็จรับเงิน
        </Button>
      </Box>

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>เลขที่ใบเสร็จรับเงิน</TableCell>
                  <TableCell>ลูกค้า</TableCell>
                  <TableCell>วันที่รับเงิน</TableCell>
                  <TableCell>ช่องทาง</TableCell>
                  <TableCell>ประเภท</TableCell>
                  <TableCell align="right">จำนวนเงิน</TableCell>
                  <TableCell align="center">หลักฐาน</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      <Link
                        component={RouterLink}
                        href={paths.dashboard.payment.details(payment.id)}
                        color="inherit"
                        variant="subtitle2"
                        underline="always"
                      >
                        {payment.receiptNo}
                      </Link>
                    </TableCell>
                    <TableCell>{payment.customer?.name ?? '-'}</TableCell>
                    <TableCell>{fDate(payment.paymentDate)}</TableCell>
                    <TableCell>{PAYMENT_METHOD_LABEL[payment.paymentMethod]}</TableCell>
                    <TableCell>{PAYMENT_PURPOSE_LABEL[payment.paymentPurpose]}</TableCell>
                    <TableCell align="right">{fBaht(payment.amount)}</TableCell>
                    <TableCell align="center">
                      {payment.slipUrl ? (
                        <Label variant="soft" color="success">
                          มีไฟล์
                        </Label>
                      ) : (
                        <Label variant="soft" color="default">
                          ไม่มีไฟล์
                        </Label>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        component={RouterLink}
                        href={paths.dashboard.payment.details(payment.id)}
                      >
                        <Iconify icon="solar:eye-bold" />
                      </IconButton>
                      <IconButton
                        component={RouterLink}
                        href={paths.dashboard.payment.edit(payment.id)}
                      >
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton color="error" onClick={() => setDeleteTarget(payment)}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="ลบใบเสร็จรับเงิน"
        content={`ต้องการลบ "${deleteTarget?.receiptNo}" ใช่หรือไม่?`}
        action={
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            ลบ
          </Button>
        }
      />
    </DashboardContent>
  );
}
