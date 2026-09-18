import type { IQuotation, QuotationStatus } from 'src/types/quotation';

import { apiFetch } from 'src/lib/api-fetch';

// ----------------------------------------------------------------------

export type QuotationItemInput = {
  serviceItemId?: string | null;
  description: string;
  unit?: string | null;
  quantity: number;
  unitPrice: number;
};

export type QuotationInput = {
  customerId: string;
  issueDate: string;
  validUntil?: string | null;
  status: QuotationStatus;
  includeVat: boolean;
  vatRate: number;
  discount: number;
  note?: string;
  paymentTerms?: string;
  items: QuotationItemInput[];
};

export async function getQuotations(status?: string): Promise<IQuotation[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const { quotations } = await apiFetch<{ quotations: IQuotation[] }>(`/api/quotations/${qs}`);
  return quotations;
}

export async function getQuotationsPage(params: {
  status?: string;
  page?: number;
  rowsPerPage?: number;
}): Promise<{ quotations: IQuotation[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  qs.set('page', String(params.page ?? 0));
  qs.set('rowsPerPage', String(params.rowsPerPage ?? 10));
  return apiFetch<{ quotations: IQuotation[]; total: number }>(`/api/quotations/?${qs}`);
}

export async function getQuotation(id: string): Promise<IQuotation> {
  const { quotation } = await apiFetch<{ quotation: IQuotation }>(`/api/quotations/${id}/`);
  return quotation;
}

export async function createQuotation(input: QuotationInput): Promise<IQuotation> {
  const { quotation } = await apiFetch<{ quotation: IQuotation }>('/api/quotations/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return quotation;
}

export async function updateQuotation(id: string, input: QuotationInput): Promise<IQuotation> {
  const { quotation } = await apiFetch<{ quotation: IQuotation }>(`/api/quotations/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return quotation;
}

export async function deleteQuotation(id: string): Promise<void> {
  await apiFetch(`/api/quotations/${id}/`, { method: 'DELETE' });
}

export async function saveQuotationSignature(
  id: string,
  signer: 'issuer' | 'customer',
  signature: string
): Promise<string> {
  const { signatureUrl } = await apiFetch<{ signatureUrl: string }>(
    `/api/quotations/${id}/signature/`,
    {
      method: 'POST',
      body: JSON.stringify({ signer, signature }),
    }
  );
  return signatureUrl;
}
