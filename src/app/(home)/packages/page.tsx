import type { Metadata } from 'next';

import { PromotionPackageListView } from 'src/sections/home/view/promotion-package-list-view';

export const metadata: Metadata = {
  title: 'แพ็กเกจและโปรโมชั่น | MEE BUNKOON GALLERY',
  description: 'ดูแพ็กเกจและโปรโมชั่นทั้งหมดจากมีบุญคุณ แกลเลอรี่',
};

export default function Page() {
  return <PromotionPackageListView />;
}
