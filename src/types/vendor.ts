export type IVendor = {
  id: string;
  name: string;
  category: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  lineId: string | null;
  taxId: string | null;
  address: string | null;
  province: string | null;
  paymentTerms: string | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
