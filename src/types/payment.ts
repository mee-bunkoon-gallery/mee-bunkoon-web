import type { ICustomer } from './quotation';

export type PaymentMethod = 'cash' | 'transfer' | 'credit_card' | 'other';
export type PaymentPurpose = 'deposit' | 'partial' | 'full' | 'other';
export type PaymentStatus = 'draft' | 'completed';

export type IPaymentQuotationReference = {
  id: string;
  quoteNo: string;
};

export type IPayment = {
  id: string;
  receiptNo: string;
  quotationId: string | null;
  contractId: string | null;
  customerId: string;
  customer?: ICustomer | null;
  quotation?: IPaymentQuotationReference | null;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentPurpose: PaymentPurpose;
  status: PaymentStatus;
  referenceNo: string | null;
  slipUrl: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};
