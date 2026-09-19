'use client';

import type { IPublicPromotionPackage } from 'src/types/promotion-package';

import { useQuery } from '@tanstack/react-query';
import { RiArrowLeftSFill, RiShieldCheckFill, RiCheckboxCircleFill } from '@remixicon/react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { fBaht } from 'src/utils/format-number';

import { Image } from 'src/components/image';
import { LoadingScreen } from 'src/components/loading-screen';

async function fetchPromotionPackage(id: string): Promise<IPublicPromotionPackage> {
  const response = await fetch(`/api/public/promotion-packages/${id}/`, { cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'ไม่พบแพ็กเกจนี้');
  return payload.package;
}

export function PromotionPackageDetailsView({ packageId }: { packageId: string }) {
  const {
    data: promotionPackage,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['public-promotion-package', packageId],
    queryFn: () => fetchPromotionPackage(packageId),
    retry: false,
  });

  if (isLoading) return <LoadingScreen />;

  if (isError || !promotionPackage) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'grid', placeItems: 'center', px: 3 }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h3">ไม่พบแพ็กเกจนี้</Typography>
          <Button component={RouterLink} href="/" variant="contained">
            กลับหน้าหลัก
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        px: { xs: 2, sm: 3, md: 8 },
        pt: { xs: 11, sm: 13, md: 14 },
        pb: { xs: 8, md: 12 },
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ mx: 'auto', maxWidth: 1280 }}>
        <Button
          component={RouterLink}
          href="/"
          color="inherit"
          startIcon={<RiArrowLeftSFill />}
          size="small"
          sx={{ mb: { xs: 2, sm: 3 } }}
        >
          กลับหน้าหลัก
        </Button>

        <Card sx={{ mb: { xs: 2, sm: 3 }, overflow: 'hidden', position: 'relative' }}>
          <Image
            alt={promotionPackage.name}
            src={promotionPackage.imageUrl || '/assets/images/empty/default.png'}
            sx={{ width: 1, height: { xs: 230, sm: 380, md: 460 } }}
          />
          <Box
            sx={{
              inset: 0,
              position: 'absolute',
              background:
                'linear-gradient(180deg, rgba(5, 15, 37, 0.04) 20%, rgba(11, 37, 84, 0.92) 100%)',
            }}
          />
          <Box
            sx={{
              left: 0,
              right: 0,
              bottom: 0,
              minWidth: 0,
              p: { xs: 2.25, sm: 3, md: 5 },
              position: 'absolute',
            }}
          >
            <Typography variant="overline" sx={{ color: 'secondary.light' }}>
              แพ็กเกจและโปรโมชั่น
            </Typography>
            <Typography
              component="h1"
              variant="h2"
              sx={{
                color: 'common.white',
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                lineHeight: 1.25,
                overflowWrap: 'anywhere',
              }}
            >
              {promotionPackage.name}
            </Typography>
          </Box>
        </Card>

        <Box
          sx={{
            gap: { xs: 2, md: 3 },
            display: 'grid',
            alignItems: 'start',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 320px' },
          }}
        >
          <Card sx={{ p: { xs: 2, sm: 3.5, md: 4 }, minWidth: 0 }}>
            {promotionPackage.description && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 1.5 }}>
                  รายละเอียดแพ็กเกจ
                </Typography>
                <Typography
                  sx={{ color: 'text.secondary', lineHeight: 1.9, whiteSpace: 'pre-line' }}
                >
                  {promotionPackage.description}
                </Typography>
              </Box>
            )}

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'baseline' }}
              justifyContent="space-between"
              spacing={0.5}
              mb={2.5}
            >
              <Typography variant="h5">รายการภายในแพ็กเกจ</Typography>
              <Typography variant="body2" color="text.secondary">
                {promotionPackage.items.length} รายการ
              </Typography>
            </Stack>

            <Stack spacing={2}>
              {promotionPackage.items.map((item, index) => (
                <Box
                  key={`${promotionPackage.id}-${index}`}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    gap: { xs: 1.5, sm: 2.5 },
                    display: 'grid',
                    alignItems: 'start',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    gridTemplateColumns: { xs: '1fr', sm: '112px minmax(0, 1fr)' },
                  }}
                >
                  <Image
                    alt={item.name}
                    src={item.imageUrl || '/assets/images/empty/default.png'}
                    sx={{
                      width: 1,
                      height: { xs: 180, sm: 112 },
                      borderRadius: 1,
                    }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={0.5}
                      justifyContent="space-between"
                      alignItems={{ sm: 'flex-start' }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.disabled">
                          รายการที่ {index + 1}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          sx={{ lineHeight: 1.4, overflowWrap: 'anywhere' }}
                        >
                          {item.name}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          px: 1.25,
                          py: 0.5,
                          flexShrink: 0,
                          borderRadius: 1,
                          color: 'primary.main',
                          bgcolor: 'primary.lighter',
                          typography: 'subtitle2',
                        }}
                      >
                        {item.quantity} {item.unit}
                      </Box>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        color: 'text.secondary',
                        lineHeight: 1.7,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {item.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                    </Typography>
                    <Box sx={{ mt: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        โทนสี
                      </Typography>
                      {item.colorThemes?.length ? (
                        <Stack
                          direction="row"
                          useFlexGap
                          flexWrap="wrap"
                          spacing={1}
                          sx={{ mt: 0.75 }}
                        >
                          {item.colorThemes.map((theme) => (
                            <Stack
                              key={theme.id}
                              direction="row"
                              spacing={0.75}
                              alignItems="center"
                              sx={{
                                px: 1.25,
                                py: 0.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 10,
                                bgcolor: 'background.paper',
                              }}
                            >
                              <Box
                                sx={{
                                  width: 14,
                                  height: 14,
                                  flexShrink: 0,
                                  borderRadius: '50%',
                                  bgcolor: theme.hexCode || 'grey.300',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                }}
                              />
                              <Typography variant="caption" sx={{ color: 'text.primary' }}>
                                {theme.name}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.disabled' }}>
                          ยังไม่ได้กำหนดโทนสี
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Card>

          <Card
            sx={{
              p: { xs: 2.5, sm: 3 },
              minWidth: 0,
              gridRow: { xs: 1, md: 'auto' },
            }}
          >
            <Typography variant="body2" color="text.secondary">
              ราคาแพ็กเกจเริ่มต้นที่
            </Typography>
            <Typography
              variant="h2"
              color="primary.main"
              sx={{ mt: 0.5, fontSize: { xs: '2rem', sm: '2.5rem' }, overflowWrap: 'anywhere' }}
            >
              {fBaht(promotionPackage.promotionPrice)}
            </Typography>
            <Box sx={{ my: 2.5, borderTop: '1px dashed', borderColor: 'divider' }} />
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box component={RiCheckboxCircleFill} color="success.main" />
                <Typography variant="body2">
                  รวมบริการ {promotionPackage.items.length} รายการ
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box component={RiShieldCheckFill} color="success.main" />
                <Typography variant="body2">รายละเอียดครบตามแพ็กเกจ</Typography>
              </Stack>
            </Stack>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
