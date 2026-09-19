import { NextResponse } from 'next/server';

import { readJson } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

import { mapContract, withIdCardUrls } from '../map-contract';

// ----------------------------------------------------------------------

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
    .from('contracts')
    .select('*, customer:customers(*), quotation:quotations(id, quote_no, total)')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  return NextResponse.json({ contract: mapContract((await withIdCardUrls(supabase, [data]))[0]) });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await readJson(request);

  if (!body.customerId) {
    return NextResponse.json({ message: 'Customer is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('contracts')
    .update({
      quotation_id: body.quotationId || null,
      contract_name: body.contractName || null,
      place_of_execution: body.placeOfExecution || null,
      customer_id: body.customerId,
      contract_date: body.contractDate,
      event_type: body.eventType || null,
      event_type_id: body.eventTypeId || null,
      event_date: body.eventDate || null,
      event_time: body.eventTime || null,
      event_location: body.eventLocation || null,
      scope_of_work: body.scopeOfWork || null,
      total_amount: body.totalAmount ?? 0,
      deposit_amount: body.depositAmount ?? 0,
      payment_terms: body.paymentTerms || null,
      terms_conditions: body.termsConditions || null,
      status: body.status || 'draft',
      note: body.note || null,
    })
    .eq('id', id)
    .select('*, customer:customers(*), quotation:quotations(id, quote_no, total)')
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ contract: mapContract((await withIdCardUrls(supabase, [data]))[0]) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { data: current } = await supabase
    .from('contracts')
    .select('id_card_front_path')
    .eq('id', id)
    .maybeSingle();

  const { error } = await supabase.from('contracts').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  // Don't leave the customer's ID card orphaned in storage.
  if (current?.id_card_front_path) {
    await supabase.storage.from('contract-id-cards').remove([current.id_card_front_path]);
  }

  return NextResponse.json({ success: true });
}
