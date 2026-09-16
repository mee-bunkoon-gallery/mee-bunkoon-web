'use client';

import type { ICustomer } from 'src/types/quotation';

import { useBoolean } from 'minimal-shared/hooks';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { TableNoData } from 'src/components/table';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { CustomerFormDialog } from './customer-form-dialog';
import { getCustomers, deleteCustomer } from './customer-api';

// ----------------------------------------------------------------------

export function CustomerListView() {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState<ICustomer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ICustomer | null>(null);

  const formDialog = useBoolean();

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error(error);
      toast.error('โหลดข้อมูลลูกค้าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleNew = () => {
    setCurrentCustomer(null);
    formDialog.onTrue();
  };

  const handleEdit = (customer: ICustomer) => {
    setCurrentCustomer(customer);
    formDialog.onTrue();
  };

  const handleSuccess = (customer: ICustomer) => {
    setCustomers((prev) => {
      const exists = prev.some((row) => row.id === customer.id);
      return exists
        ? prev.map((row) => (row.id === customer.id ? customer : row))
        : [customer, ...prev];
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteCustomer(deleteTarget.id);
      setCustomers((prev) => prev.filter((row) => row.id !== deleteTarget.id));
      toast.success('ลบลูกค้าแล้ว');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'ลบไม่สำเร็จ');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      customer.name.toLowerCase().includes(term) ||
      customer.phone?.toLowerCase().includes(term) ||
      customer.email?.toLowerCase().includes(term)
    );
  });

  const notFound = !loading && !filteredCustomers.length;

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
        <Typography variant="h4">ลูกค้า</Typography>

        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleNew}
        >
          เพิ่มลูกค้า
        </Button>
      </Box>

      <Card>
        <Box sx={{ p: 2.5 }}>
          <TextField
            fullWidth
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล..."
            sx={{ maxWidth: 360 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อลูกค้า</TableCell>
                  <TableCell>ผู้ติดต่อ</TableCell>
                  <TableCell>เบอร์โทร</TableCell>
                  <TableCell>อีเมล</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{customer.name}</Typography>
                      {customer.taxId && (
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          เลขผู้เสียภาษี: {customer.taxId}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{customer.contactPerson || '-'}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEdit(customer)}>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton color="error" onClick={() => setDeleteTarget(customer)}>
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

      <CustomerFormDialog
        open={formDialog.value}
        onClose={formDialog.onFalse}
        currentCustomer={currentCustomer}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="ลบลูกค้า"
        content={`ต้องการลบ "${deleteTarget?.name}" ใช่หรือไม่?`}
        action={
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            ลบ
          </Button>
        }
      />
    </DashboardContent>
  );
}
