import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

function mapJob(row: any) {
  return {
    id: row.id,
    jobNo: row.job_no,
    quotationId: row.quotation_id,
    contractId: row.contract_id,
    customerId: row.customer_id,
    colorThemeId: row.color_theme_id,
    colorTheme: row.color_theme
      ? { id: row.color_theme.id, name: row.color_theme.name, hexCode: row.color_theme.hex_code }
      : null,
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
    title: row.title,
    jobDate: row.job_date,
    startTime: row.start_time,
    endTime: row.end_time,
    location: row.location,
    status: row.status,
    note: row.note,
    checklist: Array.isArray(row.checklist) ? row.checklist : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function validateJobReferences(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  body: { customerId?: string; quotationId?: string | null; contractId?: string | null }
) {
  const references = await Promise.all([
    body.quotationId
      ? supabase.from('quotations').select('customer_id').eq('id', body.quotationId).single()
      : Promise.resolve({ data: null, error: null }),
    body.contractId
      ? supabase.from('contracts').select('customer_id').eq('id', body.contractId).single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const [quotation, contract] = references;

  if (quotation.error || contract.error) {
    return 'ไม่พบเอกสารอ้างอิง';
  }

  if (
    (quotation.data && quotation.data.customer_id !== body.customerId) ||
    (contract.data && contract.data.customer_id !== body.customerId)
  ) {
    return 'ลูกค้าต้องเป็นคนเดียวกับเอกสารอ้างอิง';
  }

  return null;
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
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  let query = supabase
    .from('jobs')
    .select('*, customer:customers(*), color_theme:color_themes(*)')
    .order('job_date', { ascending: true });

  if (quotationId) {
    query = query.eq('quotation_id', quotationId);
  }
  if (contractId) {
    query = query.eq('contract_id', contractId);
  }
  if (dateFrom) {
    query = query.gte('job_date', dateFrom);
  }
  if (dateTo) {
    query = query.lte('job_date', dateTo);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ jobs: data.map(mapJob) });
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

  if (!body.jobDate) {
    return NextResponse.json({ message: 'Job date is required' }, { status: 400 });
  }

  const referenceError = await validateJobReferences(supabase, body);
  if (referenceError) {
    return NextResponse.json({ message: referenceError }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      quotation_id: body.quotationId || null,
      contract_id: body.contractId || null,
      customer_id: body.customerId,
      color_theme_id: body.colorThemeId || null,
      title: body.title || '',
      job_date: body.jobDate,
      start_time: body.startTime || null,
      end_time: body.endTime || null,
      location: body.location || null,
      status: body.status || 'queued',
      note: body.note || null,
      created_by: user.id,
    })
    .select('*, customer:customers(*), color_theme:color_themes(*)')
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ job: mapJob(data) });
}
