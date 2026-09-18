import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PromotionPackageEditView } from 'src/sections/promotion-package/promotion-package-edit-view';

export const metadata: Metadata = { title: `แก้ไขแพ็กเกจ/โปรโมชั่น - ${CONFIG.appName}` };

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <PromotionPackageEditView packageId={id} />;
}
