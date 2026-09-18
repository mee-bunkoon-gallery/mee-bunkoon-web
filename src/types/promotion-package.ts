import type { IServiceItem } from './quotation';

export type IPromotionPackageItem = {
  id: string;
  serviceItemId: string;
  serviceItem: IServiceItem;
  quantity: number;
  unitPrice: number;
};

export type IPromotionPackage = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  promotionPrice: number;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  items: IPromotionPackageItem[];
  createdAt: string;
  updatedAt: string;
};

export type PromotionPackageInput = {
  name: string;
  description?: string;
  imageUrl?: string | null;
  promotionPrice: number;
  startDate?: string | null;
  endDate?: string | null;
  active: boolean;
  items: { serviceItemId: string; quantity: number; unitPrice: number }[];
};
