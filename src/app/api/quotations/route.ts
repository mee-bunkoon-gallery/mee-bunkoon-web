import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

function mapQuotation(row: any) {
  return {
    id: row.id,
    quoteNo: row.quote_no,
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
    issueDate: row.issue_date,
    validUntil: row.valid_until,
    status: row.status,
    includeVat: row.include_vat,
    vatRate: Number(row.vat_rate),
    discount: Number(row.discount),
    subtotal: Number(row.subtotal),
    vatAmount: Number(row.vat_amount),
    total: Number(row.total),
    note: row.note,
    paymentTerms: row.payment_terms,
    issuerSignatureUrl: row.issuer_signature_url,
    customerSignatureUrl: row.customer_signature_url,
    issuerSignedAt: row.issuer_signed_at,
    customerSignedAt: row.customer_signed_at,
    attachmentImageUrls: row.attachment_image_urls ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function computeTotals(
  items: { quantity: number; unitPrice: number }[],
  discount: number,
  includeVat: boolean,
  vatRate: number
) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxable = Math.max(subtotal - discount, 0);
  const vatAmount = includeVat ? (taxable * vatRate) / 100 : 0;
  const total = taxable + vatAmount;

  return { subtotal, vatAmount, total };
}

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const status = searchParams.get('status');
  const rowsPerPageParam = searchParams.get('rowsPerPage');

  let query = supabase
    .from('quotations')
    .select('*, customer:customers(*)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (rowsPerPageParam) {
    const rowsPerPage = Math.min(Math.max(Number(rowsPerPageParam) || 10, 1), 100);
    const page = Math.max(Number(searchParams.get('page')) || 0, 0);
    const from = page * rowsPerPage;
    query = query.range(from, from + rowsPerPage - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ quotations: data.map(mapQuotation), total: count ?? data.length });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const items: {
    serviceItemId?: string | null;
    promotionPackageId?: string | null;
    promotionPackageDiscount?: number;
    description: string;
    unit?: string | null;
    quantity: number;
    unitPrice: number;
  }[] = body.items ?? [];

  if (!body.customerId) {
    return NextResponse.json({ message: 'Customer is required' }, { status: 400 });
  }

  if (!items.length) {
    return NextResponse.json({ message: 'At least one item is required' }, { status: 400 });
  }

  const includeVat = body.includeVat ?? true;
  const vatRate = body.vatRate ?? 7;
  const discount = body.discount ?? 0;

  const { subtotal, vatAmount, total } = computeTotals(items, discount, includeVat, vatRate);

  const { data: quotation, error: quotationError } = await supabase
    .from('quotations')
    .insert({
      customer_id: body.customerId,
      issue_date: body.issueDate || new Date().toISOString().slice(0, 10),
      valid_until: body.validUntil || null,
      status: body.status || 'draft',
      include_vat: includeVat,
      vat_rate: vatRate,
      discount,
      subtotal,
      vat_amount: vatAmount,
      total,
      note: body.note || null,
      payment_terms: body.paymentTerms || null,
      created_by: user.id,
    })
    .select('*, customer:customers(*)')
    .single();

  if (quotationError) {
    return NextResponse.json({ message: quotationError.message }, { status: 400 });
  }

  const { error: itemsError } = await supabase.from('quotation_items').insert(
    items.map((item, index) => ({
      quotation_id: quotation.id,
      service_item_id: item.serviceItemId || null,
      promotion_package_id: item.promotionPackageId || null,
      promotion_package_discount: item.promotionPackageDiscount || 0,
      position: index,
      description: item.description,
      unit: item.unit || null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      amount: item.quantity * item.unitPrice,
    }))
  );

  if (itemsError) {
    // Best-effort rollback since this isn't a single DB transaction.
    await supabase.from('quotations').delete().eq('id', quotation.id);
    return NextResponse.json({ message: itemsError.message }, { status: 400 });
  }

  return NextResponse.json({ quotation: mapQuotation(quotation) });
}
