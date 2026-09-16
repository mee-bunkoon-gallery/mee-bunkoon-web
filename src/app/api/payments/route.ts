import type { SupabaseClient } from '@supabase/supabase-js';

import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

const SLIP_BUCKET = 'payment-slips';
const SLIP_URL_TTL = 60 * 60; // 1 hour

async function mapPayment(supabase: SupabaseClient, row: any) {
  let slipUrl: string | null = null;

  if (row.slip_path) {
    const { data } = await supabase.storage
      .from(SLIP_BUCKET)
      .createSignedUrl(row.slip_path, SLIP_URL_TTL);
    slipUrl = data?.signedUrl ?? null;
  }

  return {
    id: row.id,
    receiptNo: row.receipt_no,
    quotationId: row.quotation_id,
    quotation: row.quotation ? { id: row.quotation.id, quoteNo: row.quotation.quote_no } : null,
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
    paymentDate: row.payment_date,
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    paymentPurpose: row.payment_purpose,
    referenceNo: row.reference_no,
    slipUrl,
    note: row.note,
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

  let query = supabase
    .from('payments')
    .select('*, customer:customers(*), quotation:quotations(id, quote_no)')
    .order('payment_date', { ascending: false });

  if (quotationId) {
    query = query.eq('quotation_id', quotationId);
  }
  if (contractId) {
    query = query.eq('contract_id', contractId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const payments = await Promise.all(data.map((row) => mapPayment(supabase, row)));

  return NextResponse.json({ payments });
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

  if (!body.amount || body.amount <= 0) {
    return NextResponse.json({ message: 'Amount must be greater than 0' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('payments')
    .insert({
      quotation_id: body.quotationId || null,
      contract_id: body.contractId || null,
      customer_id: body.customerId,
      payment_date: body.paymentDate || new Date().toISOString().slice(0, 10),
      amount: body.amount,
      payment_method: body.paymentMethod || 'transfer',
      payment_purpose: body.paymentPurpose || 'partial',
      reference_no: body.referenceNo || null,
      note: body.note || null,
      created_by: user.id,
    })
    .select('*, customer:customers(*), quotation:quotations(id, quote_no)')
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ payment: await mapPayment(supabase, data) });
}
