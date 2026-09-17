'use client';

import type { IEventType } from 'src/types/event-type';

import { useState, useEffect, useCallback } from 'react';

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
import { TableNoData } from 'src/components/table';
import { Scrollbar } from 'src/components/scrollbar';

import {
  getEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
} from './event-type-api';

export function EventTypeListView() {
  const [items, setItems] = useState<IEventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');

  const loadItems = useCallback(async () => {
    try {
      setItems(await getEventTypes());
    } catch (error) {
      console.error(error);
      toast.error('โหลดรายการประเภทงานไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const closeDialog = () => {
    setOpen(false);
    setEditingId(null);
    setName('');
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setName('');
    setOpen(true);
  };

  const openEditDialog = (item: IEventType) => {
    setEditingId(item.id);
    setName(item.name);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        const updated = await updateEventType(editingId, { name });
        setItems((current) =>
          current
            .map((item) => (item.id === editingId ? updated : item))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        toast.success('แก้ไขประเภทงานแล้ว');
      } else {
        const created = await createEventType({ name });
        setItems((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('เพิ่มประเภทงานแล้ว');
      }
      closeDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'บันทึกประเภทงานไม่สำเร็จ');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEventType(id);
      setItems((current) => current.filter((item) => item.id !== id));
      toast.success('ลบประเภทงานแล้ว');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ลบประเภทงานไม่สำเร็จ');
    }
  };

  const notFound = !loading && !items.length;

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">ประเภทงาน</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={openCreateDialog}
        >
          เพิ่มประเภทงาน
        </Button>
      </Box>
      <Card>
        <TableContainer>
          <Scrollbar>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อประเภทงาน</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{item.name}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => openEditDialog(item)}>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <Tooltip title={item.inUse ? 'ไม่สามารถลบประเภทงานที่มีการใช้งานอยู่' : ''}>
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

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>
      <Dialog fullWidth maxWidth="xs" open={open} onClose={closeDialog}>
        <DialogTitle>{editingId ? 'แก้ไขประเภทงาน' : 'เพิ่มประเภทงาน'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="ชื่อประเภทงาน"
              placeholder="เช่น งานแต่งงาน"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={closeDialog}>
            ยกเลิก
          </Button>
          <Button variant="contained" disabled={!name.trim()} onClick={handleSave}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
