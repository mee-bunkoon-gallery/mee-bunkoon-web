import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { HeroBannerCreateView } from 'src/sections/hero-banner/hero-banner-create-view';

export const metadata: Metadata = { title: `เพิ่มแบนเนอร์- ${CONFIG.appName}` };

export default function Page() {
  return <HeroBannerCreateView />;
}
