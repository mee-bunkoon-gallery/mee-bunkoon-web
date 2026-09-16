'use client';

import type { IColorTheme } from 'src/types/color-theme';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
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

import { getColorThemes, createColorTheme, deleteColorTheme } from './color-theme-api';

export function ColorThemeListView() {
  const [items, setItems] = useState<IColorTheme[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [hexCode, setHexCode] = useState('#000000');

  const loadItems = useCallback(async () => {
    try {
      setItems(await getColorThemes());
    } catch (error) {
      console.error(error);
      toast.error('โหลดรายการโทนสีไม่สำเร็จ');
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCreate = async () => {
    try {
      const colorTheme = await createColorTheme({ name, hexCode });
      setItems((current) => [...current, colorTheme].sort((a, b) => a.name.localeCompare(b.name)));
      setOpen(false);
      setName('');
      setHexCode('#000000');
      toast.success('เพิ่มโทนสีแล้ว');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เพิ่มโทนสีไม่สำเร็จ');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteColorTheme(id);
      setItems((current) => current.filter((item) => item.id !== id));
      toast.success('ลบโทนสีแล้ว');
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
          onClick={() => setOpen(true)}
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
                      <IconButton color="error" onClick={() => handleDelete(item.id)}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>
      <Dialog fullWidth maxWidth="xs" open={open} onClose={() => setOpen(false)}>
        <DialogTitle>เพิ่มโทนสี</DialogTitle>
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
              onChange={(event) => setHexCode(event.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setOpen(false)}>
            ยกเลิก
          </Button>
          <Button variant="contained" disabled={!name.trim()} onClick={handleCreate}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
