import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

function mapServiceItem(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    unit: row.unit,
    unitPrice: Number(row.unit_price),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function calculateQuotationTotals(
  items: { quantity: number | string; unit_price: number | string }[],
  discount: number | string,
  includeVat: boolean,
  vatRate: number | string
) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
    0
  );
  const taxable = Math.max(subtotal - Number(discount), 0);
  const vatAmount = includeVat ? (taxable * Number(vatRate)) / 100 : 0;

  return { subtotal, vatAmount, total: taxable + vatAmount };
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase.from('service_items').select('*').eq('id', id).single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  return NextResponse.json({ serviceItem: mapServiceItem(data) });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (!body.name) {
    return NextResponse.json({ message: 'Name is required' }, { status: 400 });
  }

  const { data: previousServiceItem, error: previousServiceItemError } = await supabase
    .from('service_items')
    .select('name')
    .eq('id', id)
    .single();

  if (previousServiceItemError) {
    return NextResponse.json({ message: previousServiceItemError.message }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('service_items')
    .update({
      name: body.name,
      description: body.description || null,
      image_url: body.imageUrl || null,
      unit: body.unit || 'รายการ',
      unit_price: body.unitPrice ?? 0,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const [linkedItemsResult, previousNameItemsResult, currentNameItemsResult] = await Promise.all([
    supabase.from('quotation_items').select('id, quotation_id, quantity').eq('service_item_id', id),
    supabase
      .from('quotation_items')
      .select('id, quotation_id, quantity')
      .eq('description', previousServiceItem.name),
    supabase
      .from('quotation_items')
      .select('id, quotation_id, quantity')
      .eq('description', data.name),
  ]);

  const linkedItemsError =
    linkedItemsResult.error || previousNameItemsResult.error || currentNameItemsResult.error;

  if (linkedItemsError) {
    return NextResponse.json({ message: linkedItemsError.message }, { status: 400 });
  }

  const linkedItems = [
    ...(linkedItemsResult.data ?? []),
    ...(previousNameItemsResult.data ?? []),
    ...(currentNameItemsResult.data ?? []),
  ].filter(
    (item, index, items) => items.findIndex(({ id: itemId }) => itemId === item.id) === index
  );

  if (linkedItems.length) {
    // Quotation items render as document snapshots. Synchronize the master
    // fields and recalculate each document total after a service is updated.
    const itemResults = await Promise.all(
      linkedItems.map((item) =>
        supabase
          .from('quotation_items')
          .update({
            description: data.name,
            unit: data.unit,
            unit_price: data.unit_price,
            amount: Number(item.quantity) * Number(data.unit_price),
            service_item_id: id,
          })
          .eq('id', item.id)
      )
    );
    const itemUpdateError = itemResults.find((result) => result.error)?.error;

    if (itemUpdateError) {
      return NextResponse.json({ message: itemUpdateError.message }, { status: 400 });
    }

    const quotationIds = [...new Set(linkedItems.map((item) => item.quotation_id))];
    const { data: quotations, error: quotationsError } = await supabase
      .from('quotations')
      .select(
        'id, include_vat, vat_rate, discount, items:quotation_items(description, unit, quantity, unit_price)'
      )
      .in('id', quotationIds);

    if (quotationsError) {
      return NextResponse.json({ message: quotationsError.message }, { status: 400 });
    }

    const quotationResults = await Promise.all(
      quotations.map(async (quotation) => {
        const totals = calculateQuotationTotals(
          quotation.items ?? [],
          quotation.discount,
          quotation.include_vat,
          quotation.vat_rate
        );
        const scopeOfWork = (quotation.items ?? [])
          .map((item) => `${item.description} (${item.quantity} ${item.unit ?? ''})`.trim())
          .join('\n');

        const [quotationResult, contractResult] = await Promise.all([
          supabase.from('quotations').update(totals).eq('id', quotation.id),
          supabase
            .from('contracts')
            .update({ scope_of_work: scopeOfWork, total_amount: totals.total })
            .eq('quotation_id', quotation.id),
        ]);

        return { error: quotationResult.error || contractResult.error };
      })
    );
    const quotationUpdateError = quotationResults.find((result) => result.error)?.error;

    if (quotationUpdateError) {
      return NextResponse.json({ message: quotationUpdateError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ serviceItem: mapServiceItem(data) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase.from('service_items').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
