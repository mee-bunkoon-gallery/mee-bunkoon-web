import type { QuotationStatus } from 'src/types/quotation';

// ----------------------------------------------------------------------

export const QUOTATION_STATUS_META: Record<
  QuotationStatus,
  { label: string; color: 'default' | 'info' | 'success' | 'error' }
> = {
  draft: { label: 'ฉบับร่าง', color: 'default' },
  sent: { label: 'ส่งแล้ว', color: 'info' },
  accepted: { label: 'ลูกค้ายอมรับ', color: 'success' },
  rejected: { label: 'ลูกค้าปฏิเสธ', color: 'error' },
};
