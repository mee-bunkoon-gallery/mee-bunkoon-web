import type { ICustomer } from './quotation';

export type DeliveryMethod = 'in_person' | 'online_link' | 'courier' | 'other';
export type DeliveryStatus = 'draft' | 'delivered' | 'acknowledged';

export type IDelivery = {
  id: string;
  deliveryNo: string;
  quotationId: string | null;
  contractId: string | null;
  customerId: string;
  customer?: ICustomer | null;
  deliveryDate: string;
  deliveryMethod: DeliveryMethod;
  itemsDelivered: string | null;
  imageUrls: string[];
  note: string | null;
  status: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
};
