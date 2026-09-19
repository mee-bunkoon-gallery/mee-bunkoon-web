import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

const BUCKET = 'quotation-attachments';
const MAX_SIZE = 10 * 1024 * 1024;
const MAX_IMAGES = 10;
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

function storagePathFromPublicUrl(url: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  return index === -1 ? null : url.slice(index + marker.length);
}

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  let keepUrls: string[];

  try {
    const raw = formData.get('keepUrls');
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed) || !parsed.every((url) => typeof url === 'string')) {
      throw new Error('invalid');
    }
    keepUrls = parsed;
  } catch {
    return NextResponse.json({ message: 'Invalid keepUrls' }, { status: 400 });
  }

  const files = formData.getAll('files').filter((file): file is File => file instanceof File);
  if (keepUrls.length + files.length > MAX_IMAGES) {
    return NextResponse.json({ message: `แนบภาพได้ไม่เกิน ${MAX_IMAGES} ภาพ` }, { status: 400 });
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: 'รองรับเฉพาะไฟล์ PNG และ JPG' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'แต่ละไฟล์ต้องมีขนาดไม่เกิน 10MB' }, { status: 400 });
    }
  }

  const { data: current, error: findError } = await supabase
    .from('quotations')
    .select('attachment_image_urls')
    .eq('id', id)
    .single();
  if (findError) return NextResponse.json({ message: findError.message }, { status: 404 });

  const uploadedUrls: string[] = [];
  for (const [index, file] of files.entries()) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${id}/${crypto.randomUUID()}-${index}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      const uploadedPaths = uploadedUrls
        .map(storagePathFromPublicUrl)
        .filter((item): item is string => Boolean(item));
      if (uploadedPaths.length) await supabase.storage.from(BUCKET).remove(uploadedPaths);
      return NextResponse.json({ message: uploadError.message }, { status: 400 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);
    uploadedUrls.push(publicUrl);
  }

  const finalUrls = [...keepUrls, ...uploadedUrls];
  const { error: updateError } = await supabase
    .from('quotations')
    .update({ attachment_image_urls: finalUrls })
    .eq('id', id);

  if (updateError) {
    const uploadedPaths = uploadedUrls
      .map(storagePathFromPublicUrl)
      .filter((item): item is string => Boolean(item));
    if (uploadedPaths.length) await supabase.storage.from(BUCKET).remove(uploadedPaths);
    return NextResponse.json({ message: updateError.message }, { status: 400 });
  }

  const removedPaths = (current.attachment_image_urls ?? [])
    .filter((url: string) => !finalUrls.includes(url))
    .map(storagePathFromPublicUrl)
    .filter((item: string | null): item is string => Boolean(item));
  if (removedPaths.length) await supabase.storage.from(BUCKET).remove(removedPaths);

  return NextResponse.json({ attachmentImageUrls: finalUrls });
}
