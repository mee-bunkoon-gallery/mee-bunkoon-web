import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

function mapContract(row: any) {
  return {
    id: row.id,
    contractNo: row.contract_no,
    contractName: row.contract_name,
    placeOfExecution: row.place_of_execution,
    quotationId: row.quotation_id,
    quotation: row.quotation
      ? { id: row.quotation.id, quoteNo: row.quotation.quote_no, total: Number(row.quotation.total) }
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

  const status = new URL(request.url).searchParams.get('status');

  let query = supabase
    .from('contracts')
    .select('*, customer:customers(*), quotation:quotations(id, quote_no, total)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ contracts: data.map(mapContract) });
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
