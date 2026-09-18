'use client';

import type { ICustomer } from 'src/types/quotation';

import Typography from '@mui/material/Typography';

import { useSearchParams } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { useContractQuery } from 'src/sections/contract/contract-queries';
import { useQuotationQuery } from 'src/sections/quotation/quotation-queries';

import { usePaymentsQuery } from './payment-queries';
import { PaymentNewEditForm } from './payment-new-edit-form';

// ----------------------------------------------------------------------

export function PaymentCreateView() {
  const searchParams = useSearchParams();
  const quotationId = searchParams.get('quotationId');
  const contractId = searchParams.get('contractId');

  const { data: quotation, isLoading: isQuotationLoading } = useQuotationQuery(quotationId ?? '');
  const { data: contract, isLoading: isContractLoading } = useContractQuery(contractId ?? '');

  const { data: quotationPayments, isLoading: isQuotationPaymentsLoading } = usePaymentsQuery({
    quotationId: quotationId ?? undefined,
  });
  const { data: contractPayments, isLoading: isContractPaymentsLoading } = usePaymentsQuery({
    contractId: contractId ?? undefined,
  });

  const loading =
    (!!quotationId && (isQuotationLoading || isQuotationPaymentsLoading)) ||
    (!!contractId && (isContractLoading || isContractPaymentsLoading));

  let prefillCustomer: ICustomer | null = null;
  let prefillAmount: number | undefined;
  let prefillQuotation: { id: string; quoteNo: string } | null = null;

  if (quotationId && quotation) {
    const paid = (quotationPayments ?? []).reduce((sum, p) => sum + p.amount, 0);
    prefillCustomer = quotation.customer ?? null;
    prefillAmount = Math.max(quotation.total - paid, 0);
    prefillQuotation = { id: quotation.id, quoteNo: quotation.quoteNo };
  } else if (contractId && contract) {
    const paid = (contractPayments ?? []).reduce((sum, p) => sum + p.amount, 0);
    prefillCustomer = contract.customer ?? null;
    prefillAmount = Math.max(contract.totalAmount - paid, 0);
  }

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
