'use client';

import type { IServiceItem } from 'src/types/quotation';

import { useBoolean } from 'minimal-shared/hooks';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';
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

import { fBaht } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { TableNoData } from 'src/components/table';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { ServiceFormDialog } from './service-form-dialog';
import { getServiceItems, deleteServiceItem } from './service-api';

// ----------------------------------------------------------------------

export function ServiceListView() {
  const [serviceItems, setServiceItems] = useState<IServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentServiceItem, setCurrentServiceItem] = useState<IServiceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IServiceItem | null>(null);

  const formDialog = useBoolean();

  const fetchServiceItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getServiceItems();
      setServiceItems(data);
    } catch (error) {
      console.error(error);
      toast.error('โหลดข้อมูลรายการบริการไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServiceItems();
  }, [fetchServiceItems]);

  const handleNew = () => {
    setCurrentServiceItem(null);
    formDialog.onTrue();
  };

  const handleEdit = (serviceItem: IServiceItem) => {
    setCurrentServiceItem(serviceItem);
    formDialog.onTrue();
  };

  const handleSuccess = (serviceItem: IServiceItem) => {
    setServiceItems((prev) => {
      const exists = prev.some((row) => row.id === serviceItem.id);
      return exists
        ? prev.map((row) => (row.id === serviceItem.id ? serviceItem : row))
        : [serviceItem, ...prev];
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteServiceItem(deleteTarget.id);
      setServiceItems((prev) => prev.filter((row) => row.id !== deleteTarget.id));
      toast.success('ลบรายการบริการแล้ว');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'ลบไม่สำเร็จ');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredServiceItems = serviceItems.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return item.name.toLowerCase().includes(term);
  });

  const notFound = !loading && !filteredServiceItems.length;

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
        <Typography variant="h4">รายการบริการ</Typography>

        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleNew}
        >
          เพิ่มรายการบริการ
        </Button>
      </Box>

      <Card>
        <Box sx={{ p: 2.5 }}>
          <TextField
            fullWidth
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="ค้นหาชื่อรายการบริการ..."
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
                  <TableCell>รูปภาพ</TableCell>
                  <TableCell>ชื่อรายการบริการ</TableCell>
                  <TableCell>รายละเอียด</TableCell>
                  <TableCell>หน่วยนับ</TableCell>
                  <TableCell align="right">ราคาต่อหน่วย</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredServiceItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={item.imageUrl ?? undefined}
                        sx={{ width: 48, height: 48 }}
                      >
                        <Iconify icon="solar:box-minimalistic-bold" />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{item.name}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {item.description || '-'}
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell align="right">{fBaht(item.unitPrice)}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEdit(item)}>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton color="error" onClick={() => setDeleteTarget(item)}>
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

      <ServiceFormDialog
        open={formDialog.value}
        onClose={formDialog.onFalse}
        currentServiceItem={currentServiceItem}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="ลบรายการบริการ"
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
