import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { HeroBannerView } from 'src/sections/hero-banner/hero-banner-view';

export const metadata: Metadata = { title: `จัดการแบนเนอร์ - ${CONFIG.appName}` };

export default function Page() {
  return <HeroBannerView />;
}
