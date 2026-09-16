'use client';

import type { IContract } from 'src/types/contract';
import type { IQuotation } from 'src/types/quotation';

import { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';

import { useSearchParams } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { getQuotation } from 'src/sections/quotation/quotation-api';
import { getContract } from 'src/sections/contract/contract-api';

import { ContractNewEditForm } from './contract-new-edit-form';

// ----------------------------------------------------------------------

export function ContractCreateView() {
  const searchParams = useSearchParams();
  const quotationId = searchParams.get('quotationId');
  const duplicateId = searchParams.get('duplicateId');

  const [sourceQuotation, setSourceQuotation] = useState<IQuotation | null>(null);
  const [duplicateContract, setDuplicateContract] = useState<IContract | null>(null);
  const [loading, setLoading] = useState(!!(quotationId || duplicateId));

  useEffect(() => {
    if (!quotationId && !duplicateId) return;

    const loadSource = quotationId ? getQuotation(quotationId).then(setSourceQuotation) : Promise.resolve();
    const loadDuplicate = duplicateId ? getContract(duplicateId).then(setDuplicateContract) : Promise.resolve();

    Promise.all([loadSource, loadDuplicate])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [quotationId, duplicateId]);

  if (loading) {
    return null;
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        {duplicateContract ? 'ทำสำเนาสัญญาจ้างจัดงาน' : 'สร้างสัญญาจ้างจัดงาน'}
      </Typography>

      <ContractNewEditForm sourceQuotation={sourceQuotation} duplicateContract={duplicateContract} />
    </DashboardContent>
  );
}
