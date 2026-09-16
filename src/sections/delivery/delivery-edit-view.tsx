'use client';

import type { IDelivery } from 'src/types/delivery';

import { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';

import { getDelivery } from './delivery-api';
import { DeliveryNewEditForm } from './delivery-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  deliveryId: string;
};

export function DeliveryEditView({ deliveryId }: Props) {
  const router = useRouter();

  const [delivery, setDelivery] = useState<IDelivery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDelivery(deliveryId)
      .then(setDelivery)
      .catch((error) => {
        console.error(error);
        toast.error('ไม่พบเอกสารส่งมอบงานนี้');
        router.replace(paths.dashboard.delivery.root);
      })
      .finally(() => setLoading(false));
  }, [deliveryId, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!delivery) {
    return null;
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        แก้ไขเอกสารส่งมอบงาน {delivery.deliveryNo}
      </Typography>

      <DeliveryNewEditForm currentDelivery={delivery} />
    </DashboardContent>
  );
}
