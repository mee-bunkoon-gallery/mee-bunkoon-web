export type IVendor = {
  id: string;
  name: string;
  imageUrl: string | null;
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
  documentUrls: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
