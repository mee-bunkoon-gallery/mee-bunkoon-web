import { NextResponse } from 'next/server';

import { readJson } from 'src/lib/api/utils';
import { createSupabaseServerClient } from 'src/lib/supabase/server';

// ----------------------------------------------------------------------

type Params = { params: Promise<{ id: string }> };

type ChecklistItem = {
  id: string;
  label: string;
  detail?: string | null;
  completed: boolean;
};

function isChecklist(value: unknown): value is ChecklistItem[] {
  return (
    Array.isArray(value) &&
    value.length <= 100 &&
    value.every(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.label === 'string' &&
        typeof item.completed === 'boolean' &&
        (item.detail === undefined || item.detail === null || typeof item.detail === 'string')
    )
  );
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

  const body = await readJson(request);

  if (!isChecklist(body.checklist)) {
    return NextResponse.json({ message: 'รูปแบบรายการตรวจสอบไม่ถูกต้อง' }, { status: 400 });
  }

  const checklist = body.checklist.map((item: ChecklistItem) => ({
    id: item.id.slice(0, 200),
    label: item.label.slice(0, 500),
    detail: item.detail?.slice(0, 500) || null,
    completed: item.completed,
  }));

  const { data, error } = await supabase
    .from('jobs')
    .update({ checklist })
    .eq('id', id)
    .select('checklist')
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ checklist: data.checklist ?? [] });
}
