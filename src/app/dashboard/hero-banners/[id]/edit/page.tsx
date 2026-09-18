import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { HeroBannerEditView } from 'src/sections/hero-banner/hero-banner-edit-view';

export const metadata: Metadata = { title: `แก้ไขแบนเนอร์ - ${CONFIG.appName}` };

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <HeroBannerEditView bannerId={id} />;
}
