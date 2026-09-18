import type { IServiceItem } from 'src/types/quotation';

import { apiFetch } from 'src/lib/api-fetch';

// ----------------------------------------------------------------------

export type ServiceItemInput = {
  name: string;
  imageUrl?: string | null;
  description?: string;
  unit?: string;
  unitPrice: number;
  colorThemeIds: string[];
};

export async function getServiceItems(q?: string): Promise<IServiceItem[]> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  const { serviceItems } = await apiFetch<{ serviceItems: IServiceItem[] }>(
    `/api/service-items/${qs}`
  );
  return serviceItems;
}

export async function getServiceItemsPage(params: {
  q?: string;
  page?: number;
  rowsPerPage?: number;
}): Promise<{ serviceItems: IServiceItem[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  qs.set('page', String(params.page ?? 0));
  qs.set('rowsPerPage', String(params.rowsPerPage ?? 10));
  return apiFetch<{ serviceItems: IServiceItem[]; total: number }>(`/api/service-items/?${qs}`);
}

export async function getServiceItem(id: string): Promise<IServiceItem> {
  const { serviceItem } = await apiFetch<{ serviceItem: IServiceItem }>(
    `/api/service-items/${id}/`
  );
  return serviceItem;
}

export async function uploadServiceItemImage(id: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`/api/service-items/${id}/image/`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || 'อัปโหลดรูปภาพไม่สำเร็จ');
  return payload.imageUrl as string;
}

export async function createServiceItem(input: ServiceItemInput): Promise<IServiceItem> {
  const { serviceItem } = await apiFetch<{ serviceItem: IServiceItem }>('/api/service-items/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return serviceItem;
}

export async function updateServiceItem(
  id: string,
  input: ServiceItemInput
): Promise<IServiceItem> {
  const { serviceItem } = await apiFetch<{ serviceItem: IServiceItem }>(
    `/api/service-items/${id}/`,
    { method: 'PUT', body: JSON.stringify(input) }
  );
  return serviceItem;
}

export async function deleteServiceItem(id: string): Promise<void> {
  await apiFetch(`/api/service-items/${id}/`, { method: 'DELETE' });
}
