import type { SupabaseClient } from '@supabase/supabase-js';

const ID_CARD_BUCKET = 'contract-id-cards';
const ID_CARD_URL_TTL = 60 * 60; // 1 hour

/** Replaces each row's stored `id_card_front_path` with a short-lived signed URL (one batched call). */
export async function withIdCardUrls<T extends { id_card_front_path?: string | null }>(
  supabase: SupabaseClient,
  rows: T[]
): Promise<(T & { id_card_front_url: string | null })[]> {
  const paths = rows.map((row) => row.id_card_front_path).filter((path): path is string => !!path);
  const urlByPath = new Map<string, string>();

  if (paths.length) {
    const { data } = await supabase.storage
      .from(ID_CARD_BUCKET)
      .createSignedUrls(paths, ID_CARD_URL_TTL);

    data?.forEach((item) => {
      if (item.path && item.signedUrl) urlByPath.set(item.path, item.signedUrl);
    });
  }

  return rows.map((row) => ({
    ...row,
    id_card_front_url: row.id_card_front_path
      ? (urlByPath.get(row.id_card_front_path) ?? null)
      : null,
  }));
}

export function mapContract(row: any) {
  return {
    id: row.id,
    contractNo: row.contract_no,
    contractName: row.contract_name,
    placeOfExecution: row.place_of_execution,
    quotationId: row.quotation_id,
    quotation: row.quotation
      ? {
          id: row.quotation.id,
          quoteNo: row.quotation.quote_no,
          total: Number(row.quotation.total),
        }
      : null,
    customerId: row.customer_id,
    customer: row.customer
      ? {
          id: row.customer.id,
          name: row.customer.name,
          contactPerson: row.customer.contact_person,
          phone: row.customer.phone,
          email: row.customer.email,
          address: row.customer.address,
          taxId: row.customer.tax_id,
          note: row.customer.note,
          createdAt: row.customer.created_at,
          updatedAt: row.customer.updated_at,
        }
      : null,
    contractDate: row.contract_date,
    eventType: row.event_type,
    eventTypeId: row.event_type_id,
    eventDate: row.event_date,
    eventTime: row.event_time,
    eventLocation: row.event_location,
    scopeOfWork: row.scope_of_work,
    totalAmount: Number(row.total_amount),
    depositAmount: Number(row.deposit_amount),
    paymentTerms: row.payment_terms,
    termsConditions: row.terms_conditions,
    status: row.status,
    note: row.note,
    issuerSignatureUrl: row.issuer_signature_url,
    customerSignatureUrl: row.customer_signature_url,
    idCardFrontUrl: row.id_card_front_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
