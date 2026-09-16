'use client';

import type { ICustomer } from 'src/types/quotation';

import { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';

import { useSearchParams } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { getContract } from 'src/sections/contract/contract-api';
import { getQuotation } from 'src/sections/quotation/quotation-api';

import { getPayments } from './payment-api';
import { PaymentNewEditForm } from './payment-new-edit-form';

// ----------------------------------------------------------------------

export function PaymentCreateView() {
  const searchParams = useSearchParams();
  const quotationId = searchParams.get('quotationId');
  const contractId = searchParams.get('contractId');

  const [prefillCustomer, setPrefillCustomer] = useState<ICustomer | null>(null);
  const [prefillAmount, setPrefillAmount] = useState<number | undefined>(undefined);
  const [prefillQuotation, setPrefillQuotation] = useState<{ id: string; quoteNo: string } | null>(
    null
  );
  const [loading, setLoading] = useState(!!(quotationId || contractId));

  useEffect(() => {
    if (!quotationId && !contractId) return;

    async function loadPrefill() {
      try {
        if (quotationId) {
          const [quotation, existingPayments] = await Promise.all([
            getQuotation(quotationId),
            getPayments({ quotationId }),
          ]);
          const paid = existingPayments.reduce((sum, p) => sum + p.amount, 0);
          setPrefillCustomer(quotation.customer ?? null);
          setPrefillAmount(Math.max(quotation.total - paid, 0));
          setPrefillQuotation({ id: quotation.id, quoteNo: quotation.quoteNo });
        } else if (contractId) {
          const [contract, existingPayments] = await Promise.all([
            getContract(contractId),
            getPayments({ contractId }),
          ]);
          const paid = existingPayments.reduce((sum, p) => sum + p.amount, 0);
          setPrefillCustomer(contract.customer ?? null);
          setPrefillAmount(Math.max(contract.totalAmount - paid, 0));
        }
      } catch {
        // ignore — form still works without prefill
      } finally {
        setLoading(false);
      }
    }

    loadPrefill();
  }, [quotationId, contractId]);

  if (loading) {
    return null;
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        ออกใบเสร็จรับเงิน
      </Typography>

      <PaymentNewEditForm
        quotationId={quotationId}
        contractId={contractId}
        prefillCustomer={prefillCustomer}
        prefillAmount={prefillAmount}
        prefillQuotation={prefillQuotation}
      />
    </DashboardContent>
  );
}
