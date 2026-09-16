import type { IDelivery, DeliveryMethod, DeliveryStatus } from 'src/types/delivery';

import { apiFetch } from 'src/lib/api-fetch';

// ----------------------------------------------------------------------

export type DeliveryInput = {
  quotationId?: string | null;
  contractId?: string | null;
  customerId: string;
  deliveryDate: string;
  deliveryMethod: DeliveryMethod;
  itemsDelivered?: string;
  note?: string;
  status: DeliveryStatus;
};

export async function getDeliveries(filter?: {
  quotationId?: string;
  contractId?: string;
}): Promise<IDelivery[]> {
  const params = new URLSearchParams();
  if (filter?.quotationId) params.set('quotationId', filter.quotationId);
  if (filter?.contractId) params.set('contractId', filter.contractId);
  const qs = params.toString() ? `?${params.toString()}` : '';

  const { deliveries } = await apiFetch<{ deliveries: IDelivery[] }>(`/api/deliveries/${qs}`);
  return deliveries;
}

export async function getDelivery(id: string): Promise<IDelivery> {
  const { delivery } = await apiFetch<{ delivery: IDelivery }>(`/api/deliveries/${id}/`);
  return delivery;
}

export async function createDelivery(input: DeliveryInput): Promise<IDelivery> {
  const { delivery } = await apiFetch<{ delivery: IDelivery }>('/api/deliveries/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return delivery;
}

export async function updateDelivery(id: string, input: DeliveryInput): Promise<IDelivery> {
  const { delivery } = await apiFetch<{ delivery: IDelivery }>(`/api/deliveries/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return delivery;
}

export async function deleteDelivery(id: string): Promise<void> {
  await apiFetch(`/api/deliveries/${id}/`, { method: 'DELETE' });
}

export async function saveDeliveryImages(id: string, images: (File | string)[]): Promise<string[]> {
  const keepUrls = images.filter((image): image is string => typeof image === 'string');
  const files = images.filter((image): image is File => image instanceof File);

  const formData = new FormData();
  formData.append('keepUrls', JSON.stringify(keepUrls));
  files.forEach((file) => formData.append('files', file));

  const response = await fetch(`/api/deliveries/${id}/images/`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || 'อัปโหลดภาพไม่สำเร็จ');
  }

  return payload.imageUrls as string[];
}
