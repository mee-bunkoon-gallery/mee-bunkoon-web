'use client';

import type { IContract } from 'src/types/contract';

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

import { CONTRACT_STATUS_META } from './contract-status';
import { getContracts, deleteContract } from './contract-api';

// ----------------------------------------------------------------------

export function ContractListView() {
  const [contracts, setContracts] = useState<IContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<IContract | null>(null);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getContracts();
      setContracts(data);
    } catch (error) {
      console.error(error);
      toast.error('โหลดข้อมูลสัญญาไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteContract(deleteTarget.id);
      setContracts((prev) => prev.filter((row) => row.id !== deleteTarget.id));
      toast.success('ลบสัญญาแล้ว');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'ลบไม่สำเร็จ');
    } finally {
      setDeleteTarget(null);
    }
  };

  const notFound = !loading && !contracts.length;

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
          startIcon={<Iconify icon="mingcute:add-line" />}
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
                      <TableCell>
                        {contract.eventDate ? fDate(contract.eventDate) : '-'}
                      </TableCell>
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
                          <Iconify icon="solar:eye-bold" />
                        </IconButton>
                        <IconButton
                          component={RouterLink}
                          href={paths.dashboard.contract.edit(contract.id)}
                        >
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                        <IconButton
                          component={RouterLink}
                          href={`${paths.dashboard.contract.new}?duplicateId=${contract.id}`}
                          title="ทำสำเนาสัญญา"
                        >
                          <Iconify icon="solar:copy-bold" />
                        </IconButton>
                        <IconButton color="error" onClick={() => setDeleteTarget(contract)}>
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
