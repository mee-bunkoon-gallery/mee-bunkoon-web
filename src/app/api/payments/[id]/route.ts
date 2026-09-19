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
    receiptNo: row.receipt_no ?? 'แบบร่าง',
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
    status: row.status ?? 'completed',
    referenceNo: row.reference_no,
    slipUrl,
    note: row.note,
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
    .from('payments')
    .select('*, customer:customers(*), quotation:quotations(id, quote_no)')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  return NextResponse.json({ payment: await mapPayment(supabase, data) });
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

  if (!body.amount || body.amount <= 0) {
    return NextResponse.json({ message: 'Amount must be greater than 0' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('payments')
    .update({
      quotation_id: body.quotationId || null,
      contract_id: body.contractId || null,
      customer_id: body.customerId,
      payment_date: body.paymentDate,
      amount: body.amount,
      payment_method: body.paymentMethod || 'transfer',
      payment_purpose: body.paymentPurpose || 'partial',
      status: body.status === 'draft' ? 'draft' : 'completed',
      reference_no: body.referenceNo || null,
      note: body.note || null,
    })
    .eq('id', id)
    .select('*, customer:customers(*), quotation:quotations(id, quote_no)')
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (body.status !== 'draft' && !data.receipt_no) {
    const { error: completeError } = await supabase.rpc('complete_payment', { payment_id: id });
    if (completeError) {
      return NextResponse.json({ message: completeError.message }, { status: 400 });
    }
  }

  const { data: savedPayment, error: savedError } = await supabase
    .from('payments')
    .select('*, customer:customers(*), quotation:quotations(id, quote_no)')
    .eq('id', id)
    .single();

  if (savedError) return NextResponse.json({ message: savedError.message }, { status: 400 });

  return NextResponse.json({ payment: await mapPayment(supabase, savedPayment) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { data: current } = await supabase
    .from('payments')
    .select('slip_path')
    .eq('id', id)
    .maybeSingle();

  if (current?.slip_path) {
    await supabase.storage.from(SLIP_BUCKET).remove([current.slip_path]);
  }

  const { error } = await supabase.from('payments').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
