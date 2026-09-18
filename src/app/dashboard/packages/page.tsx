import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PromotionPackageView } from 'src/sections/promotion-package/promotion-package-view';

export const metadata: Metadata = { title: `แพ็กเกจ/โปรโมชั่น - ${CONFIG.appName}` };

export default function Page() {
  return <PromotionPackageView />;
}
