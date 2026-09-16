import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from 'src/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!['issuer', 'customer'].includes(body.signer) || typeof body.signature !== 'string') {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }
  if (!body.signature.startsWith('data:image/png;base64,') || body.signature.length > 500_000) {
    return NextResponse.json({ message: 'Invalid signature image' }, { status: 400 });
  }

  const field = body.signer === 'issuer' ? 'issuer_signature_url' : 'customer_signature_url';
  const signedAt = body.signer === 'issuer' ? 'issuer_signed_at' : 'customer_signed_at';
  const { error } = await supabase
    .from('contracts')
    .update({ [field]: body.signature, [signedAt]: new Date().toISOString() })
    .eq('id', id);
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ signatureUrl: body.signature });
}
