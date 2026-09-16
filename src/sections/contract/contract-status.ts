import type { ContractStatus } from 'src/types/contract';

// ----------------------------------------------------------------------

export const CONTRACT_STATUS_META: Record<
  ContractStatus,
  { label: string; color: 'default' | 'info' | 'success' | 'error' }
> = {
  draft: { label: 'ฉบับร่าง', color: 'default' },
  signed: { label: 'ลงนามแล้ว', color: 'success' },
  cancelled: { label: 'ยกเลิก', color: 'error' },
};
