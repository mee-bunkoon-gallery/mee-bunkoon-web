export type ICustomer = {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxId: string | null;
  citizenId: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IServiceItem = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  unit: string;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
};

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export type IQuotationItem = {
  id?: string;
  serviceItemId: string | null;
  imageUrl?: string | null;
  description: string;
  unit: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
};

export type IQuotation = {
  id: string;
  quoteNo: string;
  customerId: string;
  customer?: ICustomer | null;
  issueDate: string;
  validUntil: string | null;
  status: QuotationStatus;
  includeVat: boolean;
  vatRate: number;
  discount: number;
  subtotal: number;
  vatAmount: number;
  total: number;
  note: string | null;
  paymentTerms: string | null;
  issuerSignatureUrl: string | null;
  customerSignatureUrl: string | null;
  issuerSignedAt: string | null;
  customerSignedAt: string | null;
  items: IQuotationItem[];
  createdAt: string;
  updatedAt: string;
};
