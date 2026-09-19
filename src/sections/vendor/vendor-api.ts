import type { IVendor } from 'src/types/vendor';

import { apiFetch } from 'src/lib/api-fetch';

export type VendorInput = Omit<
  IVendor,
  'id' | 'createdAt' | 'updatedAt' | 'documentUrls' | 'imageUrl'
>;

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

export async function saveVendorDocuments(id: string, documents: (File | string)[]) {
  const formData = new FormData();
  formData.append('keepUrls', JSON.stringify(documents.filter((item): item is string => typeof item === 'string')));
  documents.filter((item): item is File => item instanceof File).forEach((file) => formData.append('files', file));
  const response = await fetch(`/api/vendors/${id}/documents/`, { method: 'POST', credentials: 'include', body: formData });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || 'อัปโหลดเอกสารไม่สำเร็จ');
  return payload.documentUrls as string[];
}

export async function uploadVendorImage(id: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`/api/vendors/${id}/image/`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || 'อัปโหลดรูป Vendor ไม่สำเร็จ');
  return payload.imageUrl as string;
}

export async function deleteVendorImage(id: string): Promise<void> {
  await apiFetch(`/api/vendors/${id}/image/`, { method: 'DELETE' });
}
