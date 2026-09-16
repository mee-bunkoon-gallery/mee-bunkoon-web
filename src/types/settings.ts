export type CompanyEntityType = 'individual' | 'company';

export type ICompanyProfile = {
  entityType: CompanyEntityType;
  name: string;
  storeNameTh: string | null;
  storeNameEn: string | null;
  branch: string | null;
  taxId: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logoUrl: string | null;
  updatedAt: string;
};
