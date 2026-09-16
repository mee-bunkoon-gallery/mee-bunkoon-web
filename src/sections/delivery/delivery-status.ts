import type { DeliveryMethod, DeliveryStatus } from 'src/types/delivery';

// ----------------------------------------------------------------------

export const DELIVERY_STATUS_META: Record<
  DeliveryStatus,
  { label: string; color: 'default' | 'info' | 'success' | 'error' }
> = {
  draft: { label: 'ฉบับร่าง', color: 'default' },
  delivered: { label: 'ส่งมอบแล้ว', color: 'info' },
  acknowledged: { label: 'ลูกค้ารับทราบแล้ว', color: 'success' },
};

export const DELIVERY_METHOD_OPTIONS: { value: DeliveryMethod; label: string }[] = [
  { value: 'in_person', label: 'ส่งมอบด้วยตนเอง' },
  { value: 'online_link', label: 'ส่งลิงก์ออนไลน์' },
  { value: 'courier', label: 'ไปรษณีย์ / ขนส่ง' },
  { value: 'other', label: 'อื่นๆ' },
];

export const DELIVERY_METHOD_LABEL: Record<DeliveryMethod, string> = {
  in_person: 'ส่งมอบด้วยตนเอง',
  online_link: 'ส่งลิงก์ออนไลน์',
  courier: 'ไปรษณีย์ / ขนส่ง',
  other: 'อื่นๆ',
};
