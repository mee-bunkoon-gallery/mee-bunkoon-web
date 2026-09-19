const THAI_DIGITS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const THAI_POSITIONS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];

function readThaiSection(value: number, hasHigherSection = false): string {
  const digits = Math.trunc(value).toString();
  let result = '';

  for (let index = 0; index < digits.length; index += 1) {
    const digit = Number(digits[index]);
    if (digit === 0) continue;

    const position = digits.length - index - 1;

    if (position === 0 && digit === 1 && (value > 1 || hasHigherSection)) {
      result += 'เอ็ด';
    } else if (position === 1 && digit === 1) {
      result += 'สิบ';
      continue;
    } else if (position === 1 && digit === 2) {
      result += 'ยี่สิบ';
      continue;
    } else {
      result += THAI_DIGITS[digit];
    }

    result += THAI_POSITIONS[position];
  }

  return result;
}

function readThaiInteger(value: number): string {
  if (value === 0) return THAI_DIGITS[0];

  const millions = Math.floor(value / 1_000_000);
  const remainder = value % 1_000_000;
  const millionText = millions ? `${readThaiInteger(millions)}ล้าน` : '';
  const remainderText = remainder ? readThaiSection(remainder, millions > 0) : '';

  return `${millionText}${remainderText}`;
}

export function fThaiBahtText(value: number): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'ศูนย์บาทถ้วน';

  const prefix = amount < 0 ? 'ลบ' : '';
  const totalSatang = Math.round(Math.abs(amount) * 100);
  const baht = Math.floor(totalSatang / 100);
  const satang = totalSatang % 100;
  const bahtText = `${readThaiInteger(baht)}บาท`;
  const satangText = satang ? `${readThaiInteger(satang)}สตางค์` : 'ถ้วน';

  return `${prefix}${bahtText}${satangText}`;
}
