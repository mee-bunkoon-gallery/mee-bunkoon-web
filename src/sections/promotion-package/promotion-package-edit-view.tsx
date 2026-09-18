'use client';

import type { IPromotionPackage } from 'src/types/promotion-package';

import { useState, useEffect } from 'react';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';

import { getPromotionPackage } from './promotion-package-api';
import { PromotionPackageNewEditForm } from './promotion-package-new-edit-form';

export function PromotionPackageEditView({ packageId }: { packageId: string }) {
  const router = useRouter();
  const [promotionPackage, setPromotionPackage] = useState<IPromotionPackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPromotionPackage(packageId)
      .then(setPromotionPackage)
      .catch(() => {
        toast.error('ไม่พบแพ็กเกจนี้');
        router.replace(paths.dashboard.promotionPackage.root);
      })
      .finally(() => setLoading(false));
  }, [packageId, router]);

  if (loading) return <LoadingScreen />;
  if (!promotionPackage) return null;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        แก้ไขแพ็กเกจ/โปรโมชั่น
      </Typography>
      <PromotionPackageNewEditForm currentPackage={promotionPackage} />
    </DashboardContent>
  );
}
