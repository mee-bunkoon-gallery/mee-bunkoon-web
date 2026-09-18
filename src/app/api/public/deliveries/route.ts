import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from 'src/lib/supabase/admin';

// ----------------------------------------------------------------------

export async function GET() {
  const supabase = createSupabaseAdminClient();

  const { data: completedJobs, error: jobsError } = await supabase
    .from('jobs')
    .select('id, title, contract_id, quotation_id, job_date')
    .eq('status', 'completed')
    .order('job_date', { ascending: false })
    .limit(100);

  if (jobsError) {
    return NextResponse.json({ message: jobsError.message }, { status: 400 });
  }

  const { data: deliveries, error } = await supabase
    .from('deliveries')
    .select(
      'id, delivery_no, delivery_date, items_delivered, image_urls, contract_id, quotation_id'
    )
    .in('status', ['delivered', 'acknowledged'])
    .order('delivery_date', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const completedDeliveries = (deliveries ?? [])
    .map((delivery) => {
      const job = (completedJobs ?? []).find(
        (item) =>
          (!!delivery.contract_id && item.contract_id === delivery.contract_id) ||
          (!!delivery.quotation_id && item.quotation_id === delivery.quotation_id)
      );

      if (!job) return null;

      return {
        id: delivery.id,
        jobId: job.id,
        jobTitle: job.title,
        deliveryNo: delivery.delivery_no,
        deliveryDate: delivery.delivery_date,
        itemsDelivered: delivery.items_delivered,
        imageUrls: delivery.image_urls ?? [],
      };
    })
    .filter((delivery) => delivery !== null)
    .slice(0, 12);

  return NextResponse.json({ deliveries: completedDeliveries });
}
