'use client';

import type { IServiceItem } from 'src/types/quotation';

import { useState, useEffect } from 'react';
import {
  RiAddLine,
  RiEditLine,
  RiListCheck2,
  RiSearchLine,
  RiDeleteBin6Line,
} from '@remixicon/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
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

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fBaht } from 'src/utils/format-number';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { TableNoData, TablePaginationCustom } from 'src/components/table';

import { useServiceItemsPageQuery, useDeleteServiceItemMutation } from './service-queries';

// ----------------------------------------------------------------------

export function ServiceListView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<IServiceItem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const { data, isLoading } = useServiceItemsPageQuery({
    q: debouncedSearch,
    page,
    rowsPerPage,
  });
  const serviceItems = data?.serviceItems ?? [];
  const total = data?.total ?? 0;

  const deleteMutation = useDeleteServiceItemMutation();

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('ลบรายการบริการแล้ว');
      if (serviceItems.length === 1 && page > 0) {
        setPage(page - 1);
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'ลบไม่สำเร็จ');
    } finally {
      setDeleteTarget(null);
    }
  };

  const notFound = !isLoading && !serviceItems.length;

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
          component={RouterLink}
          href={paths.dashboard.service.new}
          variant="contained"
          startIcon={<RiAddLine />}
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
                    <RiSearchLine />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>รูปภาพ</TableCell>
                  <TableCell sx={{ minWidth: 300 }}>ชื่อรายการบริการ</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>โทนสี</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>หน่วยนับ</TableCell>
                  <TableCell align="right" sx={{ minWidth: 140 }}>
                    ราคาต่อหน่วย
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 140 }}>
                    จัดการ
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {serviceItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={item.imageUrl || '/assets/images/empty/default.png'}
                        sx={{ width: 48, height: 48 }}
                      >
                        <RiListCheck2 />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{item.name}</Typography>
                      <Typography variant="caption">{item.description || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" flexWrap="wrap" gap={0.75}>
                        {item.colorThemes.length ? (
                          item.colorThemes.map((theme) => (
                            <Chip
                              key={theme.id}
                              size="small"
                              variant="outlined"
                              label={theme.name}
                              icon={
                                <Box
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    bgcolor: theme.hexCode,
                                    borderRadius: '50%',
                                  }}
                                />
                              }
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            -
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell align="right">{fBaht(item.unitPrice)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        component={RouterLink}
                        href={paths.dashboard.service.edit(item.id)}
                      >
                        <RiEditLine />
                      </IconButton>
                      <IconButton color="error" onClick={() => setDeleteTarget(item)}>
                        <RiDeleteBin6Line />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

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
