'use client';

import type { IPayment } from 'src/types/payment';

import { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';

import { getPayment } from './payment-api';
import { PaymentNewEditForm } from './payment-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  paymentId: string;
};

export function PaymentEditView({ paymentId }: Props) {
  const router = useRouter();

  const [payment, setPayment] = useState<IPayment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayment(paymentId)
      .then(setPayment)
      .catch((error) => {
        console.error(error);
        toast.error('ไม่พบใบเสร็จรับเงินนี้');
        router.replace(paths.dashboard.payment.root);
      })
      .finally(() => setLoading(false));
  }, [paymentId, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!payment) {
    return null;
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        แก้ไขใบเสร็จรับเงิน {payment.receiptNo}
      </Typography>

      <PaymentNewEditForm currentPayment={payment} />
    </DashboardContent>
  );
}
