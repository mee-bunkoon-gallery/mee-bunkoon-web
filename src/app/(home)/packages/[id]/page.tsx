import type { Metadata } from 'next';

import { PromotionPackageDetailsView } from 'src/sections/home/view/promotion-package-details-view';

export const metadata: Metadata = {
  title: 'รายละเอียดแพ็กเกจ | MEE BUNKOON GALLERY',
};

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <PromotionPackageDetailsView packageId={id} />;
}
