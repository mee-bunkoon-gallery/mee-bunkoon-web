import type { IEventType } from './event-type';
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
  eventTypeId: string | null;
  eventType: IEventType | null;
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
  eventTypeId: string;
  items: { serviceItemId: string; quantity: number; unitPrice: number }[];
};

export type IPublicPromotionPackage = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  promotionPrice: number;
  items: {
    name: string;
    description: string | null;
    imageUrl: string | null;
    quantity: number;
    unit: string;
    colorThemes: {
      id: string;
      name: string;
      hexCode: string | null;
    }[];
  }[];
};
