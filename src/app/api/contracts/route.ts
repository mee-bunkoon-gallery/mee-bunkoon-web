import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

import { mapContract } from './map-contract';

// ----------------------------------------------------------------------

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
    .from('contracts')
    .select('*, customer:customers(*), quotation:quotations(id, quote_no, total)', {
      count: 'exact',
    })
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

  return NextResponse.json({ contracts: data.map(mapContract), total: count ?? data.length });
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

  if (!body.customerId) {
    return NextResponse.json({ message: 'Customer is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('contracts')
    .insert({
      quotation_id: body.quotationId || null,
      contract_name: body.contractName || null,
      place_of_execution: body.placeOfExecution || null,
      customer_id: body.customerId,
      contract_date: body.contractDate || new Date().toISOString().slice(0, 10),
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
      created_by: user.id,
    })
    .select('*, customer:customers(*), quotation:quotations(id, quote_no, total)')
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ contract: mapContract(data) });
}
