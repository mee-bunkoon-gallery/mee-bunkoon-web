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
