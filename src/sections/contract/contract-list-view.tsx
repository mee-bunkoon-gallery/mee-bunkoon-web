'use client';

import type { IContract } from 'src/types/contract';

import { useState } from 'react';
import {
  RiAddLine,
  RiEyeFill,
  RiEditLine,
  RiFileCopyLine,
  RiDeleteBin6Fill,
} from '@remixicon/react';

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
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { TableNoData, TablePaginationCustom } from 'src/components/table';

import { CONTRACT_STATUS_META } from './contract-status';
import { useContractsPageQuery, useDeleteContractMutation } from './contract-queries';

// ----------------------------------------------------------------------

export function ContractListView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<IContract | null>(null);

  const { data, isLoading } = useContractsPageQuery({ page, rowsPerPage });
  const contracts = data?.contracts ?? [];
  const total = data?.total ?? 0;

  const deleteMutation = useDeleteContractMutation();

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('ลบสัญญาแล้ว');
      if (contracts.length === 1 && page > 0) {
        setPage(page - 1);
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'ลบไม่สำเร็จ');
    } finally {
      setDeleteTarget(null);
    }
  };

  const notFound = !isLoading && !contracts.length;

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
        <Typography variant="h4">สัญญาจ้างจัดงาน</Typography>

        <Button
          component={RouterLink}
          href={paths.dashboard.contract.new}
          variant="contained"
          startIcon={<RiAddLine />}
        >
          สร้างสัญญา
        </Button>
      </Box>

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>เลขที่สัญญา</TableCell>
                  <TableCell>ลูกค้า</TableCell>
                  <TableCell>วันที่จัดงาน</TableCell>
                  <TableCell align="right">มูลค่าสัญญา</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {contracts.map((contract) => {
                  const statusMeta = CONTRACT_STATUS_META[contract.status];

                  return (
                    <TableRow key={contract.id} hover>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          href={paths.dashboard.contract.details(contract.id)}
                          color="inherit"
                          variant="subtitle2"
                          underline="always"
                        >
                          {contract.contractNo}
                        </Link>
                      </TableCell>
                      <TableCell>{contract.customer?.name ?? '-'}</TableCell>
                      <TableCell>{contract.eventDate ? fDate(contract.eventDate) : '-'}</TableCell>
                      <TableCell align="right">{fBaht(contract.totalAmount)}</TableCell>
                      <TableCell>
                        <Label variant="soft" color={statusMeta.color}>
                          {statusMeta.label}
                        </Label>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          component={RouterLink}
                          href={paths.dashboard.contract.details(contract.id)}
                        >
                          <RiEyeFill />
                        </IconButton>
                        <IconButton
                          component={RouterLink}
                          href={paths.dashboard.contract.edit(contract.id)}
                        >
                          <RiEditLine />
                        </IconButton>
                        <IconButton
                          component={RouterLink}
                          href={`${paths.dashboard.contract.new}?duplicateId=${contract.id}`}
                          title="ทำสำเนาสัญญา"
                        >
                          <RiFileCopyLine />
                        </IconButton>
                        <IconButton color="error" onClick={() => setDeleteTarget(contract)}>
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
        title="ลบสัญญา"
        content={`ต้องการลบสัญญา "${deleteTarget?.contractNo}" ใช่หรือไม่?`}
        action={
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            ลบ
          </Button>
        }
      />
    </DashboardContent>
  );
}
