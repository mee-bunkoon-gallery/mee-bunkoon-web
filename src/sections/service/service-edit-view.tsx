'use client';

import type { IServiceItem } from 'src/types/quotation';

import { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';

import { getServiceItem } from './service-api';
import { ServiceNewEditForm } from './service-new-edit-form';

export function ServiceEditView({ serviceItemId }: { serviceItemId: string }) {
  const router = useRouter();
  const [serviceItem, setServiceItem] = useState<IServiceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getServiceItem(serviceItemId)
      .then(setServiceItem)
      .catch(() => {
        toast.error('ไม่พบรายการบริการนี้');
        router.replace(paths.dashboard.service.root);
      })
      .finally(() => setIsLoading(false));
  }, [router, serviceItemId]);

  if (isLoading) return <LoadingScreen />;
  if (!serviceItem) return null;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        แก้ไขรายการบริการ
      </Typography>
      <ServiceNewEditForm currentServiceItem={serviceItem} />
    </DashboardContent>
  );
}
