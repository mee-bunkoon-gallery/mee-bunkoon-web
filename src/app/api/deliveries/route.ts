import { NextResponse } from 'next/server';

import { readJson } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

function mapDelivery(row: any) {
  return {
    id: row.id,
    deliveryNo: row.delivery_no,
    quotationId: row.quotation_id,
    contractId: row.contract_id,
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
    deliveryDate: row.delivery_date,
    deliveryMethod: row.delivery_method,
    itemsDelivered: row.items_delivered,
    imageUrls: row.image_urls ?? [],
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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
  const quotationId = searchParams.get('quotationId');
  const contractId = searchParams.get('contractId');
  const status = searchParams.get('status');
  const rowsPerPageParam = searchParams.get('rowsPerPage');

  let query = supabase
    .from('deliveries')
    .select('*, customer:customers(*)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (quotationId) {
    query = query.eq('quotation_id', quotationId);
  }
  if (contractId) {
    query = query.eq('contract_id', contractId);
  }
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

  return NextResponse.json({ deliveries: data.map(mapDelivery), total: count ?? data.length });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await readJson(request);

  if (!body.customerId) {
    return NextResponse.json({ message: 'Customer is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('deliveries')
    .insert({
      quotation_id: body.quotationId || null,
      contract_id: body.contractId || null,
      customer_id: body.customerId,
      delivery_date: body.deliveryDate || new Date().toISOString().slice(0, 10),
      delivery_method: body.deliveryMethod || 'in_person',
      items_delivered: body.itemsDelivered || null,
      note: body.note || null,
      status: body.status || 'draft',
      created_by: user.id,
    })
    .select('*, customer:customers(*)')
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ delivery: mapDelivery(data) });
}
