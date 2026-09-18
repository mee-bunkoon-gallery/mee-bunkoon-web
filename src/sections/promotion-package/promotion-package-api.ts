import type { IPromotionPackage, PromotionPackageInput } from 'src/types/promotion-package';

import { apiFetch } from 'src/lib/api-fetch';

export async function getPromotionPackages(q?: string): Promise<IPromotionPackage[]> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  const { packages } = await apiFetch<{ packages: IPromotionPackage[] }>(
    `/api/promotion-packages?${params.toString()}`
  );
  return packages;
}

export async function getPromotionPackage(id: string): Promise<IPromotionPackage> {
  const { package: promotionPackage } = await apiFetch<{ package: IPromotionPackage }>(
    `/api/promotion-packages/${id}`
  );
  return promotionPackage;
}

export async function createPromotionPackage(input: PromotionPackageInput) {
  const { package: promotionPackage } = await apiFetch<{ package: IPromotionPackage }>(
    '/api/promotion-packages',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  );
  return promotionPackage;
}

export async function updatePromotionPackage(id: string, input: PromotionPackageInput) {
  await apiFetch(`/api/promotion-packages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deletePromotionPackage(id: string) {
  await apiFetch(`/api/promotion-packages/${id}`, { method: 'DELETE' });
}

export async function uploadPromotionPackageImage(id: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`/api/promotion-packages/${id}/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || 'อัปโหลดรูปภาพไม่สำเร็จ');
  return payload.imageUrl as string;
}
