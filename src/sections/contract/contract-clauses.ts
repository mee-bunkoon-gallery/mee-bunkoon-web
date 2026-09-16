import type { ICompanyProfile } from 'src/types/settings';
import type { MentionOption } from './contract-mention-text-field';
import type { IContract, IContractClause } from 'src/types/contract';

import { uuidv4 } from 'minimal-shared/utils';

import { fDate } from 'src/utils/format-time';
import { fBaht } from 'src/utils/format-number';

import { escapeHtml, ensureHtmlContent } from 'src/components/editor';

// ----------------------------------------------------------------------

/**
 * Options offered by the "@" picker in the clause title/body editors. "role_*" entries are
 * fixed legal terms inserted as literal text; the rest are merge fields — inserted as a
 * `{{key}}` token that gets resolved to the contract's actual data at preview/PDF time (see
 * `resolveContractMentionTokens`), so edits to the customer or company profile stay in sync.
 */
export const CONTRACT_MENTION_FIELDS: MentionOption[] = [
  { value: 'role_customer', label: 'ผู้ว่าจ้าง (คำเรียกฝ่ายลูกค้า)' },
  { value: 'role_company', label: 'ผู้รับจ้าง (คำเรียกฝ่ายเรา)' },
  { value: 'customer_name', label: 'ชื่อลูกค้า' },
  { value: 'customer_citizen_id', label: 'เลขบัตรประชาชนลูกค้า' },
  { value: 'customer_address', label: 'ที่อยู่ลูกค้า' },
  { value: 'customer_phone', label: 'เบอร์โทรลูกค้า' },
  { value: 'company_name', label: 'ชื่อบริษัท (ผู้รับจ้าง)' },
  { value: 'company_address', label: 'ที่อยู่บริษัท' },
  { value: 'company_tax_id', label: 'เลขผู้เสียภาษีบริษัท' },
  { value: 'contract_date', label: 'วันที่ทำสัญญา' },
  { value: 'contract_place', label: 'ทำขึ้นที่' },
  { value: 'contract_total', label: 'มูลค่าสัญญา' },
  { value: 'quotation_no', label: 'เลขที่ใบเสนอราคาอ้างอิง' },
];

export const DEFAULT_CONTRACT_CLAUSES: IContractClause[] = [
  {
    id: 'default-1',
    title: 'การปฏิบัติตามสัญญา',
    body: 'คู่สัญญาทั้งสองฝ่ายตกลงปฏิบัติตามรายละเอียดและเงื่อนไขที่ระบุในสัญญาฉบับนี้',
  },
  {
    id: 'default-2',
    title: 'การยกเลิกงาน',
    body: 'หากผู้ว่าจ้างยกเลิกงานหลังจากลงนามในสัญญาแล้ว เงินมัดจำที่ชำระแล้วจะไม่ได้รับคืน',
  },
  {
    id: 'default-3',
    title: 'เหตุสุดวิสัย',
    body: 'หากมีเหตุสุดวิสัยทำให้ไม่สามารถจัดงานได้ตามกำหนด ทั้งสองฝ่ายจะร่วมกันพิจารณาเลื่อนวันจัดงานตามความเหมาะสม',
  },
  {
    id: 'default-4',
    title: 'การใช้ภาพและวิดีโอ',
    body: 'ผู้รับจ้างขอสงวนสิทธิ์ในการนำภาพ/วิดีโอจากงานไปใช้เพื่อการประชาสัมพันธ์ เว้นแต่ผู้ว่าจ้างแจ้งไม่ประสงค์เป็นลายลักษณ์อักษร',
  },
];

/**
 * termsConditions is stored as a single text column. New contracts store a JSON-encoded
 * array of clauses there; older contracts stored one plain term per line, which is
 * parsed here as a set of untitled clauses so existing data keeps rendering correctly.
 */
export function parseContractClauses(raw: string | null | undefined): IContractClause[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed) && parsed.every((item) => item && typeof item === 'object' && 'body' in item)) {
      return parsed.map((item, index) => ({
        id: typeof item.id === 'string' && item.id ? item.id : `clause-${index}`,
        title: typeof item.title === 'string' ? item.title : '',
        body: typeof item.body === 'string' ? item.body : '',
      }));
    }
  } catch {
    // not JSON — fall through to the legacy plain-text format
  }

  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((body, index) => ({ id: `legacy-${index}`, title: '', body }));
}

export function stringifyContractClauses(clauses: IContractClause[]): string {
  const cleaned = clauses
    .map((clause) => ({ id: clause.id, title: clause.title.trim(), body: clause.body.trim() }))
    .filter((clause) => clause.title || clause.body);

  return cleaned.length ? JSON.stringify(cleaned) : '';
}

export function createEmptyContractClause(): IContractClause {
  return { id: uuidv4(), title: '', body: '' };
}

/**
 * Clause bodies written with the rich text editor are stored as HTML. Clauses saved before
 * that editor existed (or migrated from the legacy newline-per-term format) hold plain text,
 * so this wraps each line in a <p> for both the read-only preview and the PDF converter.
 */
export const toClauseBodyHtml = ensureHtmlContent;

export type ContractMentionContext = Record<string, string>;

export function buildContractMentionContext(
  contract: IContract,
  companyProfile?: ICompanyProfile | null
): ContractMentionContext {
  return {
    role_customer: 'ผู้ว่าจ้าง',
    role_company: 'ผู้รับจ้าง',
    customer_name: contract.customer?.name ?? '-',
    customer_citizen_id: contract.customer?.citizenId ?? '-',
    customer_address: contract.customer?.address ?? '-',
    customer_phone: contract.customer?.phone ?? '-',
    company_name: companyProfile?.storeNameTh || companyProfile?.name || '-',
    company_address: companyProfile?.address ?? '-',
    company_tax_id: companyProfile?.taxId ?? '-',
    contract_date: contract.contractDate ? fDate(contract.contractDate) : '-',
    contract_place: contract.placeOfExecution ?? '-',
    contract_total: fBaht(contract.totalAmount),
    quotation_no: contract.quotation?.quoteNo ?? '-',
  };
}

const MENTION_TOKEN_REGEX = /\{\{\s*([a-z_]+)\s*\}\}/gi;

/**
 * Replaces `{{key}}` merge-field tokens (inserted via the "@" picker) with the resolved
 * value for this contract, as plain text. Use this for fields rendered as-is (e.g. the
 * clause title) — for clause-body/scope HTML, use `resolveContractMentionHtml` instead so
 * the resolved value can be bolded.
 */
export function resolveContractMentionTokens(text: string, context: ContractMentionContext): string {
  if (!text) return text;

  return text.replace(MENTION_TOKEN_REGEX, (match, key: string) => context[key] ?? match);
}

/**
 * Same as `resolveContractMentionTokens`, but for HTML content: the resolved value is
 * wrapped in <strong> so merge fields stand out from the surrounding body text.
 */
export function resolveContractMentionHtml(text: string, context: ContractMentionContext): string {
  if (!text) return text;

  return text.replace(MENTION_TOKEN_REGEX, (match, key: string) => {
    const value = context[key];
    return value === undefined ? match : `<strong>${escapeHtml(value)}</strong>`;
  });
}
