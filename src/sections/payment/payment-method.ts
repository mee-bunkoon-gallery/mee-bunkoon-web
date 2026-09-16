import type { PaymentMethod, PaymentPurpose } from 'src/types/payment';

// ----------------------------------------------------------------------

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'เงินสด' },
  { value: 'transfer', label: 'โอนเงิน' },
  { value: 'credit_card', label: 'บัตรเครดิต' },
  { value: 'other', label: 'อื่นๆ' },
];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: 'เงินสด',
  transfer: 'โอนเงิน',
  credit_card: 'บัตรเครดิต',
  other: 'อื่นๆ',
};

export const PAYMENT_PURPOSE_OPTIONS: { value: PaymentPurpose; label: string }[] = [
  { value: 'deposit', label: 'เงินมัดจำ' },
  { value: 'partial', label: 'ชำระบางส่วน' },
  { value: 'full', label: 'ชำระครบถ้วน' },
  { value: 'other', label: 'อื่น ๆ' },
];

export const PAYMENT_PURPOSE_LABEL: Record<PaymentPurpose, string> = {
  deposit: 'เงินมัดจำ',
  partial: 'ชำระบางส่วน',
  full: 'ชำระครบถ้วน',
  other: 'อื่น ๆ',
};
