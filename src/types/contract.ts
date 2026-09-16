import type { ICustomer } from './quotation';

export type ContractStatus = 'draft' | 'signed' | 'cancelled';

export type IContractClause = {
  id: string;
  title: string;
  body: string;
};

export type IContractQuotationRef = {
  id: string;
  quoteNo: string;
  total: number;
};

export type IContract = {
  id: string;
  contractNo: string;
  contractName: string | null;
  placeOfExecution: string | null;
  quotationId: string | null;
  quotation?: IContractQuotationRef | null;
  customerId: string;
  customer?: ICustomer | null;
  contractDate: string;
  eventType: string | null;
  eventDate: string | null;
  eventTime: string | null;
  eventLocation: string | null;
  scopeOfWork: string | null;
  totalAmount: number;
  depositAmount: number;
  paymentTerms: string | null;
  termsConditions: string | null;
  status: ContractStatus;
  note: string | null;
  issuerSignatureUrl: string | null;
  customerSignatureUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
