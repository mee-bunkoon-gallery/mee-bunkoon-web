import { NextResponse } from 'next/server';

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
    .from('deliveries')
    .select('*, customer:customers(*)')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  return NextResponse.json({ delivery: mapDelivery(data) });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (!body.customerId) {
    return NextResponse.json({ message: 'Customer is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('deliveries')
    .update({
      quotation_id: body.quotationId || null,
      contract_id: body.contractId || null,
      customer_id: body.customerId,
      delivery_date: body.deliveryDate,
      delivery_method: body.deliveryMethod || 'in_person',
      items_delivered: body.itemsDelivered || null,
      note: body.note || null,
      status: body.status || 'draft',
    })
    .eq('id', id)
    .select('*, customer:customers(*)')
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ delivery: mapDelivery(data) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase.from('deliveries').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
