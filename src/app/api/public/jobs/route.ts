import { NextResponse } from 'next/server';

import { publicJson } from 'src/lib/api/utils';
import { createSupabaseAdminClient } from 'src/lib/supabase/admin';

// ----------------------------------------------------------------------

export async function GET() {
  const supabase = createSupabaseAdminClient();

  const [{ data: jobs, error: jobsError }, { data: company, error: companyError }] =
    await Promise.all([
      supabase
        .from('jobs')
        .select('id, job_no, title, job_date, start_time, end_time, status')
        .neq('status', 'cancelled')
        .gte('job_date', new Date().toISOString().slice(0, 10))
        .order('job_date', { ascending: true }),
      supabase
        .from('company_profile')
        .select('name, store_name_th, store_name_en, logo_url')
        .eq('id', 'default')
        .maybeSingle(),
    ]);

  if (jobsError || companyError) {
    return NextResponse.json({ message: 'Failed to load data' }, { status: 400 });
  }

  return publicJson({
    company: company
      ? {
          name: company.store_name_th || company.name,
          nameEn: company.store_name_en,
          logoUrl: company.logo_url,
        }
      : null,
    jobs: (jobs ?? []).map((job) => ({
      id: job.id,
      jobNo: job.job_no,
      title: job.title || 'คิวงาน',
      jobDate: job.job_date,
      startTime: job.start_time,
      endTime: job.end_time,
      status: job.status,
    })),
  });
}
