import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

const BUCKET = 'vendor-documents';
const MAX_FILES = 10;
const MAX_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

function pathFromUrl(url: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index < 0 ? null : url.slice(index + marker.length);
}

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  let keepUrls: string[] = [];
  try {
    const parsed = JSON.parse(String(formData.get('keepUrls') ?? '[]'));
    if (!Array.isArray(parsed) || !parsed.every((url) => typeof url === 'string')) throw new Error();
    keepUrls = parsed;
  } catch {
    return NextResponse.json({ message: 'ข้อมูลเอกสารไม่ถูกต้อง' }, { status: 400 });
  }
  const files = formData.getAll('files').filter((file): file is File => file instanceof File);
  if (keepUrls.length + files.length > MAX_FILES) return NextResponse.json({ message: `แนบเอกสารได้ไม่เกิน ${MAX_FILES} ไฟล์` }, { status: 400 });
  if (files.some((file) => !ALLOWED_TYPES.includes(file.type))) return NextResponse.json({ message: 'รองรับ PDF, PNG, JPG และ WEBP เท่านั้น' }, { status: 400 });
  if (files.some((file) => file.size > MAX_SIZE)) return NextResponse.json({ message: 'แต่ละไฟล์ต้องไม่เกิน 15MB' }, { status: 400 });

  const { data: current, error: findError } = await supabase.from('vendors').select('document_urls').eq('id', id).single();
  if (findError) return NextResponse.json({ message: findError.message }, { status: 404 });

  const uploadedUrls: string[] = [];
  for (const file of files) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const path = `${id}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (error) return NextResponse.json({ message: error.message }, { status: 400 });
    uploadedUrls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
  }

  const documentUrls = [...keepUrls, ...uploadedUrls];
  const { error: updateError } = await supabase.from('vendors').update({ document_urls: documentUrls }).eq('id', id);
  if (updateError) return NextResponse.json({ message: updateError.message }, { status: 400 });

  const removedPaths = (current.document_urls ?? []).filter((url: string) => !documentUrls.includes(url)).map(pathFromUrl).filter((path: string | null): path is string => !!path);
  if (removedPaths.length) await supabase.storage.from(BUCKET).remove(removedPaths);
  return NextResponse.json({ documentUrls });
}
