import type { ICompanyProfile } from 'src/types/settings';

import { apiFetch } from 'src/lib/api-fetch';

// ----------------------------------------------------------------------

export type CompanyProfileInput = {
  entityType: ICompanyProfile['entityType'];
  name: string;
  storeNameTh?: string;
  storeNameEn?: string;
  branch?: string;
  taxId?: string;
  phone?: string;
  email?: string;
  address?: string;
};

export async function getCompanyProfile(): Promise<ICompanyProfile> {
  const { profile } = await apiFetch<{ profile: ICompanyProfile }>('/api/settings/company/');
  return profile;
}

export async function updateCompanyProfile(input: CompanyProfileInput): Promise<ICompanyProfile> {
  const { profile } = await apiFetch<{ profile: ICompanyProfile }>('/api/settings/company/', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return profile;
}

export async function uploadCompanyLogo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/settings/company/logo/', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || 'อัปโหลดโลโก้ไม่สำเร็จ');
  }

  return payload.logoUrl as string;
}

export async function deleteCompanyLogo(): Promise<void> {
  await apiFetch('/api/settings/company/logo/', { method: 'DELETE' });
}
