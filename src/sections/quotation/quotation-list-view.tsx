'use client';

import type { IQuotation } from 'src/types/quotation';

import { useState } from 'react';

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
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { TableNoData, TablePaginationCustom } from 'src/components/table';

import { QUOTATION_STATUS_META } from './quotation-status';
import { useQuotationsPageQuery, useDeleteQuotationMutation } from './quotation-queries';

// ----------------------------------------------------------------------

export function QuotationListView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<IQuotation | null>(null);

  const { data, isLoading } = useQuotationsPageQuery({ page, rowsPerPage });
  const quotations = data?.quotations ?? [];
  const total = data?.total ?? 0;

  const deleteMutation = useDeleteQuotationMutation();

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('ลบใบเสนอราคาแล้ว');
      if (quotations.length === 1 && page > 0) {
        setPage(page - 1);
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'ลบไม่สำเร็จ');
    } finally {
      setDeleteTarget(null);
    }
  };

  const notFound = !isLoading && !quotations.length;

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
        <Typography variant="h4">ใบเสนอราคา</Typography>

        <Button
          component={RouterLink}
          href={paths.dashboard.quotation.new}
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          สร้างใบเสนอราคา
        </Button>
      </Box>

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>เลขที่</TableCell>
                  <TableCell>ลูกค้า</TableCell>
                  <TableCell>วันที่ออก</TableCell>
                  <TableCell align="right">ยอดรวม</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {quotations.map((quotation) => {
                  const statusMeta = QUOTATION_STATUS_META[quotation.status];

                  return (
                    <TableRow key={quotation.id} hover>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          href={paths.dashboard.quotation.details(quotation.id)}
                          color="inherit"
                          variant="subtitle2"
                          underline="always"
                        >
                          {quotation.quoteNo}
                        </Link>
                      </TableCell>
                      <TableCell>{quotation.customer?.name ?? '-'}</TableCell>
                      <TableCell>{fDate(quotation.issueDate)}</TableCell>
                      <TableCell align="right">{fBaht(quotation.total)}</TableCell>
                      <TableCell>
                        <Label variant="soft" color={statusMeta.color}>
                          {statusMeta.label}
                        </Label>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          component={RouterLink}
                          href={paths.dashboard.quotation.details(quotation.id)}
                        >
                          <Iconify icon="solar:eye-bold" />
                        </IconButton>
                        <IconButton
                          component={RouterLink}
                          href={paths.dashboard.quotation.edit(quotation.id)}
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton color="error" onClick={() => setDeleteTarget(quotation)}>
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
        title="ลบใบเสนอราคา"
        content={`ต้องการลบใบเสนอราคา "${deleteTarget?.quoteNo}" ใช่หรือไม่?`}
        action={
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            ลบ
          </Button>
        }
      />
    </DashboardContent>
  );
}
