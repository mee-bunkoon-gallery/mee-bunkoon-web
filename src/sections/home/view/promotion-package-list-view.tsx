'use client';

import type { IPublicPromotionPackage } from 'src/types/promotion-package';

import { useQuery } from '@tanstack/react-query';
import { RiGiftFill, RiArrowRightSFill, RiCheckboxCircleFill } from '@remixicon/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fBaht } from 'src/utils/format-number';

import { Image } from 'src/components/image';
import { LoadingScreen } from 'src/components/loading-screen';

async function fetchPromotionPackages(): Promise<IPublicPromotionPackage[]> {
  const response = await fetch('/api/public/promotion-packages/', { cache: 'no-store' });
  if (!response.ok) throw new Error('โหลดข้อมูลโปรโมชั่นไม่สำเร็จ');
  const payload = await response.json();
  return payload.packages ?? [];
}

export function PromotionPackageListView() {
  const { data: promotionPackages = [], isLoading } = useQuery({
    queryKey: ['public-promotion-packages', 'all'],
    queryFn: fetchPromotionPackages,
    retry: false,
  });

  if (isLoading) return <LoadingScreen />;

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        px: { xs: 2.5, md: 8 },
        pt: { xs: 14, md: 12 },
        pb: { xs: 8, md: 12 },
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ mx: 'auto', maxWidth: 1280 }}>
        <Box
          sx={{
            mb: { xs: 4, md: 6 },
            px: { xs: 3, md: 6 },
            py: { xs: 5, md: 6 },
            overflow: 'hidden',
            color: 'common.white',
            borderRadius: 2.5,
            position: 'relative',
            backgroundImage:
              'linear-gradient(105deg, rgba(249, 245, 239, 0.98), rgba(255, 253, 247, 0.78)), url(/assets/background/hero-3.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 24px 54px rgba(248, 250, 249, 0.2)',
          }}
        >
          <Box sx={{ zIndex: 1, maxWidth: 760, position: 'relative' }}>
            <Typography variant="overline" color="secondary" sx={{ letterSpacing: 2 }}>
              PACKAGES & PROMOTIONS
            </Typography>
            <Typography variant="h2" color="primary" sx={{ mt: 1 }}>
              แพ็กเกจสำหรับทุกช่วงเวลาสำคัญ
            </Typography>
            <Typography color="primary" sx={{ mt: 1.5, lineHeight: 1.8 }}>
              เลือกแพ็กเกจที่เหมาะกับรูปแบบงานและงบประมาณของคุณ พร้อมดูรายละเอียดบริการทั้งหมด
            </Typography>
          </Box>
        </Box>

        {promotionPackages.length ? (
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
            }}
          >
            {promotionPackages.map((promotionPackage) => (
              <Card
                key={promotionPackage.id}
                component={RouterLink}
                href={paths.promotionPackages.details(promotionPackage.id)}
                aria-label={`ดูรายละเอียดแพ็กเกจ ${promotionPackage.name}`}
                sx={{
                  color: 'inherit',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 12px 34px rgba(5,37,24,0.07)',
                  transition: 'transform 180ms ease, box-shadow 180ms ease',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: 14 },
                  '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
                }}
              >
                <Image
                  alt={promotionPackage.name}
                  src={promotionPackage.imageUrl || '/assets/images/empty/default.png'}
                  sx={{ width: 1, height: 260 }}
                />
                <Stack spacing={2} sx={{ p: 3 }}>
                  <Box>
                    <Typography variant="h5">{promotionPackage.name}</Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        color: 'text.secondary',
                        lineHeight: 1.7,
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                      }}
                    >
                      {promotionPackage.description || 'แพ็กเกจบริการสำหรับงานสำคัญของคุณ'}
                    </Typography>
                  </Box>

                  <Stack spacing={0.75}>
                    {promotionPackage.items.slice(0, 3).map((item, itemIndex) => (
                      <Stack
                        key={`${promotionPackage.id}-${itemIndex}`}
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <Box component={RiCheckboxCircleFill} width={18} color="success.main" />
                        <Typography variant="body2" noWrap>
                          {item.name}
                        </Typography>
                      </Stack>
                    ))}
                    {promotionPackage.items.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        และอีก {promotionPackage.items.length - 3} รายการ
                      </Typography>
                    )}
                  </Stack>

                  <Stack
                    direction="row"
                    alignItems="flex-end"
                    justifyContent="space-between"
                    sx={{ pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        ราคาแพ็กเกจ
                      </Typography>
                      <Typography variant="h4" color="primary.main">
                        {fBaht(promotionPackage.promotionPrice)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        display: 'grid',
                        borderRadius: '50%',
                        placeItems: 'center',
                        color: 'common.white',
                        bgcolor: 'primary.main',
                      }}
                    >
                      <RiArrowRightSFill />
                    </Box>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Box>
        ) : (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <Box component={RiGiftFill} width={56} color="text.disabled" />
            <Typography variant="h5" sx={{ mt: 2 }}>
              ยังไม่มีโปรโมชั่นในขณะนี้
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              โปรดติดตามแพ็กเกจและโปรโมชั่นใหม่เร็ว ๆ นี้
            </Typography>
          </Card>
        )}
      </Box>
    </Box>
  );
}
