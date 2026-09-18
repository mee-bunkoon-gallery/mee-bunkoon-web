'use client';

import type { IColorTheme } from 'src/types/color-theme';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ColorPicker } from 'src/components/color-utils';
import { TablePaginationCustom } from 'src/components/table';

import {
  useColorThemesPageQuery,
  useCreateColorThemeMutation,
  useDeleteColorThemeMutation,
  useUpdateColorThemeMutation,
} from './color-theme-queries';

const COLOR_OPTIONS = [
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#03A9F4',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFEB3B',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#795548',
  '#607D8B',
  '#9E9E9E',
  '#000000',
];

const isValidHex = (value: string) => /^#[0-9A-F]{6}$/i.test(value);

export function ColorThemeListView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [hexCode, setHexCode] = useState('#000000');

  const { data } = useColorThemesPageQuery({ page, rowsPerPage });
  const items = data?.colorThemes ?? [];
  const total = data?.total ?? 0;

  const createMutation = useCreateColorThemeMutation();
  const updateMutation = useUpdateColorThemeMutation();
  const deleteMutation = useDeleteColorThemeMutation();

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const closeDialog = () => {
    setOpen(false);
    setEditingId(null);
    setName('');
    setHexCode('#000000');
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setName('');
    setHexCode('#000000');
    setOpen(true);
  };

  const openEditDialog = (item: IColorTheme) => {
    setEditingId(item.id);
    setName(item.name);
    setHexCode(item.hexCode || '#000000');
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, input: { name, hexCode } });
        toast.success('แก้ไขโทนสีแล้ว');
      } else {
        await createMutation.mutateAsync({ name, hexCode });
        toast.success('เพิ่มโทนสีแล้ว');
      }
      closeDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'บันทึกโทนสีไม่สำเร็จ');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('ลบโทนสีแล้ว');
      if (items.length === 1 && page > 0) {
        setPage(page - 1);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ลบโทนสีไม่สำเร็จ');
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">โทนสี</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={openCreateDialog}
        >
          เพิ่มโทนสี
        </Button>
      </Box>
      <Card>
        <TableContainer>
          <Scrollbar>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>สี</TableCell>
                  <TableCell>ชื่อโทนสี</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          bgcolor: item.hexCode || 'transparent',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{item.name}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => openEditDialog(item)}>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <Tooltip title={item.inUse ? 'ไม่สามารถลบโทนสีที่มีการใช้งานอยู่' : ''}>
                        <span>
                          <IconButton
                            color="error"
                            disabled={item.inUse}
                            onClick={() => handleDelete(item.id)}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
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
      <Dialog fullWidth maxWidth="xs" open={open} onClose={closeDialog}>
        <DialogTitle>{editingId ? 'แก้ไขโทนสี' : 'เพิ่มโทนสี'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', gap: 2, flexDirection: 'column' }}>
            <TextField
              autoFocus
              label="ชื่อโทนสี"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <TextField
              label="รหัสสี"
              value={hexCode}
              error={!!hexCode && !isValidHex(hexCode)}
              helperText={
                hexCode && !isValidHex(hexCode) ? 'กรุณากรอกรหัสสี เช่น #4CAF50' : undefined
              }
              onChange={(event) => setHexCode(event.target.value.toUpperCase())}
              slotProps={{
                input: {
                  startAdornment: (
                    <Box
                      component="input"
                      type="color"
                      aria-label="เลือกสีจากตารางสี"
                      value={isValidHex(hexCode) ? hexCode : '#000000'}
                      onChange={(event) => setHexCode(event.target.value.toUpperCase())}
                      sx={{
                        width: 32,
                        height: 32,
                        p: 0,
                        mr: 1,
                        border: 0,
                        bgcolor: 'transparent',
                        cursor: 'pointer',
                      }}
                    />
                  ),
                },
              }}
            />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                เลือกจากชุดสี
              </Typography>
              <ColorPicker
                size={42}
                limit={8}
                variant="rounded"
                options={COLOR_OPTIONS}
                value={hexCode}
                onChange={(value) => setHexCode(value as string)}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={closeDialog}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            disabled={!name.trim() || !isValidHex(hexCode)}
            onClick={handleSave}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
