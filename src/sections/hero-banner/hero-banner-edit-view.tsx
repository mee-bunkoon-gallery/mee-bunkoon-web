'use client';

import { useEffect } from 'react';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';

import { useHeroBannerQuery } from './hero-banner-queries';
import { HeroBannerNewEditForm } from './hero-banner-new-edit-form';

export function HeroBannerEditView({ bannerId }: { bannerId: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useHeroBannerQuery(bannerId);

  useEffect(() => {
    if (isError) {
      toast.error('ไม่พบ Banner นี้');
      router.replace(paths.dashboard.heroBanner.root);
    }
  }, [isError, router]);

  if (isLoading) return <LoadingScreen />;
  if (isError || !data) return null;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        แก้ไขแบนเนอร์
      </Typography>
      <HeroBannerNewEditForm currentBanner={data} />
    </DashboardContent>
  );
}
