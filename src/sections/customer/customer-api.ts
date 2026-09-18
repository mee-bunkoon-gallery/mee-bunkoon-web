import type { ICustomer } from 'src/types/quotation';

import { apiFetch } from 'src/lib/api-fetch';

// ----------------------------------------------------------------------

export type CustomerInput = {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  citizenId?: string;
  note?: string;
};

export async function getCustomers(q?: string): Promise<ICustomer[]> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  const { customers } = await apiFetch<{ customers: ICustomer[] }>(`/api/customers/${qs}`);
  return customers;
}

export async function getCustomersPage(params: {
  q?: string;
  page?: number;
  rowsPerPage?: number;
}): Promise<{ customers: ICustomer[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  qs.set('page', String(params.page ?? 0));
  qs.set('rowsPerPage', String(params.rowsPerPage ?? 10));
  return apiFetch<{ customers: ICustomer[]; total: number }>(`/api/customers/?${qs}`);
}

export async function createCustomer(input: CustomerInput): Promise<ICustomer> {
  const { customer } = await apiFetch<{ customer: ICustomer }>('/api/customers/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return customer;
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<ICustomer> {
  const { customer } = await apiFetch<{ customer: ICustomer }>(`/api/customers/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return customer;
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiFetch(`/api/customers/${id}/`, { method: 'DELETE' });
}
