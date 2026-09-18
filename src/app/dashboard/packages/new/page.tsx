import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PromotionPackageCreateView } from 'src/sections/promotion-package/promotion-package-create-view';

export const metadata: Metadata = { title: `สร้างแพ็กเกจ/โปรโมชั่น - ${CONFIG.appName}` };

export default function Page() {
  return <PromotionPackageCreateView />;
}
