'use client';

import type { IQuotation } from 'src/types/quotation';

import { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';

import { getQuotation } from './quotation-api';
import { QuotationNewEditForm } from './quotation-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  quotationId: string;
};

export function QuotationEditView({ quotationId }: Props) {
  const router = useRouter();

  const [quotation, setQuotation] = useState<IQuotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuotation(quotationId)
      .then(setQuotation)
      .catch((error) => {
        console.error(error);
        toast.error('ไม่พบใบเสนอราคานี้');
        router.replace(paths.dashboard.quotation.root);
      })
      .finally(() => setLoading(false));
  }, [quotationId, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!quotation) {
    return null;
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        แก้ไขใบเสนอราคา {quotation.quoteNo}
      </Typography>

      <QuotationNewEditForm currentQuotation={quotation} />
    </DashboardContent>
  );
}
