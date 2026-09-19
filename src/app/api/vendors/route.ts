import { NextResponse } from 'next/server';

import { readJson, sanitizeSearchTerm } from 'src/lib/api/utils';
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

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const q = sanitizeSearchTerm(params.get('q') ?? '');
  const rowsPerPage = Math.min(Math.max(Number(params.get('rowsPerPage')) || 10, 1), 100);
  const page = Math.max(Number(params.get('page')) || 0, 0);
  const from = page * rowsPerPage;

  let query = supabase
    .from('vendors')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + rowsPerPage - 1);

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,category.ilike.%${q}%,contact_person.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  return NextResponse.json({ vendors: data.map(mapVendor), total: count ?? data.length });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await readJson(request);
  if (!body.name?.trim()) {
    return NextResponse.json({ message: 'กรุณากรอกชื่อ Vendor' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('vendors')
    .insert({ ...toRow(body), created_by: user.id })
    .select('*')
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ vendor: mapVendor(data) });
}
