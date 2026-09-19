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
    items: (row.items ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((item: any) => ({
        id: item.id,
        serviceItemId: item.service_item_id,
        promotionPackageId: item.promotion_package_id,
        promotionPackageDiscount: Number(item.promotion_package_discount || 0),
        imageUrl: item.service_item?.image_url ?? null,
        description: item.description,
        unit: item.unit,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        amount: Number(item.amount),
      })),
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

type Params = { params: Promise<{ id: string }> };

async function requireUser(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('quotations')
    .select(
      '*, customer:customers(*), items:quotation_items(*, service_item:service_items(image_url))'
    )
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  return NextResponse.json({ quotation: mapQuotation(data) });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

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
    .update({
      customer_id: body.customerId,
      issue_date: body.issueDate,
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
    })
    .eq('id', id)
    .select('*, customer:customers(*)')
    .single();

  if (quotationError) {
    return NextResponse.json({ message: quotationError.message }, { status: 400 });
  }

  const { error: deleteError } = await supabase
    .from('quotation_items')
    .delete()
    .eq('quotation_id', id);

  if (deleteError) {
    return NextResponse.json({ message: deleteError.message }, { status: 400 });
  }

  const { error: itemsError } = await supabase.from('quotation_items').insert(
    items.map((item, index) => ({
      quotation_id: id,
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
    return NextResponse.json({ message: itemsError.message }, { status: 400 });
  }

  return NextResponse.json({ quotation: mapQuotation(quotation) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { data: quotation } = await supabase
    .from('quotations')
    .select('attachment_image_urls')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('quotations').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const attachmentPaths = (quotation?.attachment_image_urls ?? [])
    .map((url: string) => storagePathFromPublicUrl(url))
    .filter((path: string | null): path is string => Boolean(path));
  if (attachmentPaths.length) {
    await supabase.storage.from('quotation-attachments').remove(attachmentPaths);
  }

  return NextResponse.json({ success: true });
}

function storagePathFromPublicUrl(url: string) {
  const marker = '/storage/v1/object/public/quotation-attachments/';
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}
