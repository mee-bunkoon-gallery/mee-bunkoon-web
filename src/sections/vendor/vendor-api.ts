import type { IVendor } from 'src/types/vendor';

import { apiFetch } from 'src/lib/api-fetch';

export type VendorInput = Omit<IVendor, 'id' | 'createdAt' | 'updatedAt'>;

export async function getVendorsPage(params: {
  q?: string;
  page: number;
  rowsPerPage: number;
}): Promise<{ vendors: IVendor[]; total: number }> {
  const query = new URLSearchParams({
    page: String(params.page),
    rowsPerPage: String(params.rowsPerPage),
  });
  if (params.q) query.set('q', params.q);
  return apiFetch(`/api/vendors/?${query}`);
}

export async function getVendor(id: string): Promise<IVendor> {
  const { vendor } = await apiFetch<{ vendor: IVendor }>(`/api/vendors/${id}/`);
  return vendor;
}

export async function getVendors(): Promise<IVendor[]> {
  const { vendors } = await apiFetch<{ vendors: IVendor[] }>('/api/vendors/?rowsPerPage=100');
  return vendors;
}

export async function createVendor(input: VendorInput): Promise<IVendor> {
  const { vendor } = await apiFetch<{ vendor: IVendor }>('/api/vendors/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return vendor;
}

export async function updateVendor(id: string, input: VendorInput): Promise<IVendor> {
  const { vendor } = await apiFetch<{ vendor: IVendor }>(`/api/vendors/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return vendor;
}

export async function deleteVendor(id: string): Promise<void> {
  await apiFetch(`/api/vendors/${id}/`, { method: 'DELETE' });
}
