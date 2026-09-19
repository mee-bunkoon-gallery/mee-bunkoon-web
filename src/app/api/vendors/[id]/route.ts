import { NextResponse } from 'next/server';

import { readJson } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

function mapVendor(row: any) {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.image_url,
    category: row.category,
    contactPerson: row.contact_person,
    phone: row.phone,
    email: row.email,
    lineId: row.line_id,
    taxId: row.tax_id,
    address: row.address,
    province: row.province,
    paymentTerms: row.payment_terms,
    note: row.note,
    documentUrls: row.document_urls ?? [],
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(body: any) {
  return {
    name: body.name,
    category: body.category || null,
    contact_person: body.contactPerson || null,
    phone: body.phone || null,
    email: body.email || null,
    line_id: body.lineId || null,
    tax_id: body.taxId || null,
    address: body.address || null,
    province: body.province || null,
    payment_terms: body.paymentTerms || null,
    note: body.note || null,
    is_active: body.isActive !== false,
  };
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase.from('vendors').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ message: error.message }, { status: 404 });
  return NextResponse.json({ vendor: mapVendor(data) });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await readJson(request);
  if (!body.name?.trim()) {
    return NextResponse.json({ message: 'กรุณากรอกชื่อ Vendor' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('vendors')
    .update(toRow(body))
    .eq('id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ vendor: mapVendor(data) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase.from('vendors').delete().eq('id', id);
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
