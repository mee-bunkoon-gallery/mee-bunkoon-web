import type { IPayment, PaymentMethod, PaymentPurpose } from 'src/types/payment';

import { apiFetch } from 'src/lib/api-fetch';

// ----------------------------------------------------------------------

export type PaymentInput = {
  quotationId?: string | null;
  contractId?: string | null;
  customerId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentPurpose: PaymentPurpose;
  referenceNo?: string;
  note?: string;
};

export async function getPayments(filter?: {
  quotationId?: string;
  contractId?: string;
}): Promise<IPayment[]> {
  const params = new URLSearchParams();
  if (filter?.quotationId) params.set('quotationId', filter.quotationId);
  if (filter?.contractId) params.set('contractId', filter.contractId);
  const qs = params.toString() ? `?${params.toString()}` : '';

  const { payments } = await apiFetch<{ payments: IPayment[] }>(`/api/payments/${qs}`);
  return payments;
}

export async function getPaymentsPage(params: {
  page?: number;
  rowsPerPage?: number;
}): Promise<{ payments: IPayment[]; total: number }> {
  const qs = new URLSearchParams();
  qs.set('page', String(params.page ?? 0));
  qs.set('rowsPerPage', String(params.rowsPerPage ?? 10));
  return apiFetch<{ payments: IPayment[]; total: number }>(`/api/payments/?${qs}`);
}

export async function getPayment(id: string): Promise<IPayment> {
  const { payment } = await apiFetch<{ payment: IPayment }>(`/api/payments/${id}/`);
  return payment;
}

export async function createPayment(input: PaymentInput): Promise<IPayment> {
  const { payment } = await apiFetch<{ payment: IPayment }>('/api/payments/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return payment;
}

export async function updatePayment(id: string, input: PaymentInput): Promise<IPayment> {
  const { payment } = await apiFetch<{ payment: IPayment }>(`/api/payments/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return payment;
}

export async function deletePayment(id: string): Promise<void> {
  await apiFetch(`/api/payments/${id}/`, { method: 'DELETE' });
}

export async function uploadPaymentSlip(id: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/payments/${id}/slip/`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || 'อัปโหลดหลักฐานการโอนไม่สำเร็จ');
  }

  return payload.slipUrl as string;
}

export async function deletePaymentSlip(id: string): Promise<void> {
  await apiFetch(`/api/payments/${id}/slip/`, { method: 'DELETE' });
}
