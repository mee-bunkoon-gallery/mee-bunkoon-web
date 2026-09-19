'use client';

import type { IVendor } from 'src/types/vendor';

import { useState, useEffect } from 'react';
import { RiAddLine, RiEditLine, RiSearchLine, RiDeleteBin6Line } from '@remixicon/react';

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

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { TableNoData, TablePaginationCustom } from 'src/components/table';

import { useVendorsPageQuery, useDeleteVendorMutation } from './vendor-queries';

export function VendorListView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<IVendor | null>(null);
  const deleteMutation = useDeleteVendorMutation();

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => setPage(0), [query]);

  const { data, isLoading } = useVendorsPageQuery({ q: query, page, rowsPerPage });
  const vendors = data?.vendors ?? [];

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('ลบ Vendor แล้ว');
      if (vendors.length === 1 && page > 0) setPage(page - 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ลบไม่สำเร็จ');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ mb: 5, gap: 2, display: 'flex', alignItems: { sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4">Vendor</Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>จัดการผู้รับจ้างและซัพพลายเออร์สำหรับงานของคุณ</Typography>
        </Box>
        <Button component={RouterLink} href={paths.dashboard.vendor.new} variant="contained" startIcon={<RiAddLine />}>เพิ่ม Vendor</Button>
      </Box>

      <Card>
        <Box sx={{ p: 2.5 }}>
          <TextField
            fullWidth
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาชื่อ ประเภทงาน ผู้ติดต่อ หรือเบอร์โทร..."
            sx={{ maxWidth: 440 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><RiSearchLine /></InputAdornment> } }}
          />
        </Box>
        <TableContainer sx={{ overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 860 }}>
              <TableHead><TableRow><TableCell>Vendor</TableCell><TableCell>ประเภทงาน</TableCell><TableCell>ผู้ติดต่อ</TableCell><TableCell>จังหวัด</TableCell><TableCell>สถานะ</TableCell><TableCell align="right">จัดการ</TableCell></TableRow></TableHead>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id} hover>
                    <TableCell><Typography variant="subtitle2">{vendor.name}</Typography><Typography variant="caption" sx={{ color: 'text.secondary' }}>{vendor.phone || vendor.email || '-'}</Typography></TableCell>
                    <TableCell>{vendor.category || '-'}</TableCell>
                    <TableCell>{vendor.contactPerson || '-'}</TableCell>
                    <TableCell>{vendor.province || '-'}</TableCell>
                    <TableCell><Label variant="soft" color={vendor.isActive ? 'success' : 'default'}>{vendor.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}</Label></TableCell>
                    <TableCell align="right"><IconButton component={RouterLink} href={paths.dashboard.vendor.edit(vendor.id)}><RiEditLine /></IconButton><IconButton color="error" onClick={() => setDeleteTarget(vendor)}><RiDeleteBin6Line /></IconButton></TableCell>
                  </TableRow>
                ))}
                <TableNoData notFound={!isLoading && !vendors.length} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
        <TablePaginationCustom
          page={page}
          count={data?.total ?? 0}
          rowsPerPage={rowsPerPage}
          onPageChange={(_event, value) => setPage(value)}
          onRowsPerPageChange={(event) => { setPage(0); setRowsPerPage(Number(event.target.value)); }}
        />
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="ลบ Vendor"
        content={`ต้องการลบ “${deleteTarget?.name}” ใช่หรือไม่?`}
        action={<Button color="error" variant="contained" onClick={confirmDelete}>ลบ</Button>}
      />
    </DashboardContent>
  );
}
