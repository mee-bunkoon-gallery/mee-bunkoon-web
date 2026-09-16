'use client';

import type { IContract } from 'src/types/contract';
import type { IQuotation } from 'src/types/quotation';

import { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';

import { useSearchParams } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { getContract } from 'src/sections/contract/contract-api';
import { getQuotation } from 'src/sections/quotation/quotation-api';

import { DeliveryNewEditForm } from './delivery-new-edit-form';

// ----------------------------------------------------------------------

export function DeliveryCreateView() {
  const searchParams = useSearchParams();
  const quotationId = searchParams.get('quotationId');
  const contractId = searchParams.get('contractId');

  const [sourceQuotation, setSourceQuotation] = useState<IQuotation | null>(null);
  const [sourceContract, setSourceContract] = useState<IContract | null>(null);
  const [loading, setLoading] = useState(!!(quotationId || contractId));

  useEffect(() => {
    if (!quotationId && !contractId) return;

    Promise.all([
      quotationId ? getQuotation(quotationId).then(setSourceQuotation) : null,
      contractId ? getContract(contractId).then(setSourceContract) : null,
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [quotationId, contractId]);

  if (loading) {
    return null;
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        สร้างเอกสารส่งมอบงาน
      </Typography>

      <DeliveryNewEditForm
        sourceQuotation={sourceQuotation}
        sourceContract={sourceContract}
        quotationId={quotationId}
        contractId={contractId}
      />
    </DashboardContent>
  );
}
