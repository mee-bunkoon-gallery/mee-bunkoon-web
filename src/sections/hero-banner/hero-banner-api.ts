import type { IHeroBanner, HeroBannerInput } from 'src/types/hero-banner';

import { apiFetch } from 'src/lib/api-fetch';

export async function getHeroBanners(params: { page: number; rowsPerPage: number }): Promise<{
  banners: IHeroBanner[];
  total: number;
}> {
  const query = new URLSearchParams({
    page: String(params.page),
    rowsPerPage: String(params.rowsPerPage),
  });
  return apiFetch<{ banners: IHeroBanner[]; total: number }>(`/api/hero-banners/?${query}`);
}

export async function getHeroBanner(id: string): Promise<IHeroBanner> {
  const { banner } = await apiFetch<{ banner: IHeroBanner }>(`/api/hero-banners/${id}/`);
  return banner;
}

export async function createHeroBanner(input: HeroBannerInput): Promise<IHeroBanner> {
  const { banner } = await apiFetch<{ banner: IHeroBanner }>('/api/hero-banners/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return banner;
}

export async function updateHeroBanner(id: string, input: HeroBannerInput): Promise<IHeroBanner> {
  const { banner } = await apiFetch<{ banner: IHeroBanner }>(`/api/hero-banners/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return banner;
}

export async function uploadHeroBannerImage(id: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`/api/hero-banners/${id}/image/`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'อัปโหลดภาพไม่สำเร็จ');
  return payload.imageUrl;
}

export async function deleteHeroBanner(id: string): Promise<void> {
  await apiFetch(`/api/hero-banners/${id}/`, { method: 'DELETE' });
}
