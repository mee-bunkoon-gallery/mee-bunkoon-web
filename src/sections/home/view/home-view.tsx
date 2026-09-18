'use client';

import type { IPublicPromotionPackage } from 'src/types/promotion-package';

import { useState } from 'react';
import Fade from 'embla-carousel-fade';
import Autoplay from 'embla-carousel-autoplay';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate } from 'src/utils/format-time';
import { fBaht } from 'src/utils/format-number';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { Carousel, useCarousel } from 'src/components/carousel';

const HERO_IMAGES = [
  '/assets/background/hero-1.jpg',
  '/assets/background/hero-2.jpg',
  '/assets/background/hero-3.jpg',
];

const FALLBACK_GALLERY = [
  '/assets/mee-bunkoon/hero-1.jpg',
  '/assets/mee-bunkoon/hero-2.jpg',
  '/assets/mee-bunkoon/hero-3.jpg',
  '/assets/mee-bunkoon/hero-4.jpg',
];

const DEFAULT_COMPANY = {
  name: 'มีบุญคุณ แกลเลอรี่',
  nameEn: 'MEE BUNKOON GALLERY',
  address: 'บ้านเหล่า ตำบลเม็กดำ พยัคฆภูมิพิสัย จังหวัดมหาสารคาม',
  phone: '098-630-4174',
  logoUrl: null as string | null,
};

type PublicCompany = typeof DEFAULT_COMPANY;
type GalleryImage = { title: string; subtitle?: string; src: string };
type PublicDelivery = {
  id: string;
  deliveryNo: string;
  deliveryDate: string;
  itemsDelivered: string | null;
  imageUrls: string[];
};

const HIGHLIGHTS = [
  {
    icon: 'solar:palette-bold-duotone',
    title: 'ออกแบบเฉพาะคุณ',
    body: 'ออกแบบธีม สี และองค์ประกอบให้เข้ากับเรื่องราวและงบประมาณของคุณ',
  },
  {
    icon: 'solar:stars-bold-duotone',
    title: 'ครบทุกองค์ประกอบ',
    body: 'ดูแลฉาก ดอกไม้ แสง สี เสียง และรายละเอียดสำคัญไว้ในทีมเดียว',
  },
  {
    icon: 'solar:shield-check-bold-duotone',
    title: 'ทีมงานมืออาชีพ',
    body: 'วางแผน ประสานงาน และดูแลหน้างาน เพื่อให้วันสำคัญเป็นไปอย่างราบรื่น',
  },
];

async function fetchPublicCompany(): Promise<PublicCompany> {
  const response = await fetch('/api/public/company/', { cache: 'no-store' });
  if (!response.ok) return DEFAULT_COMPANY;
  const payload = await response.json();
  if (!payload?.company) return DEFAULT_COMPANY;
  return {
    name: payload.company.name || DEFAULT_COMPANY.name,
    nameEn: payload.company.nameEn || DEFAULT_COMPANY.nameEn,
    address: payload.company.address || DEFAULT_COMPANY.address,
    phone: payload.company.phone || DEFAULT_COMPANY.phone,
    logoUrl: payload.company.logoUrl ?? null,
  };
}

async function fetchPublicDeliveries(): Promise<PublicDelivery[]> {
  const response = await fetch('/api/public/deliveries/', { cache: 'no-store' });
  if (!response.ok) return [];
  return (await response.json())?.deliveries ?? [];
}

async function fetchPublicPromotionPackages(): Promise<IPublicPromotionPackage[]> {
  const response = await fetch('/api/public/promotion-packages/?limit=6', { cache: 'no-store' });
  if (!response.ok) return [];
  return (await response.json())?.packages ?? [];
}

export function HomeView() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const heroCarousel = useCarousel({ loop: true, duration: 80 }, [
    Fade(),
    Autoplay({ playOnInit: true, delay: 5500 }),
  ]);
  const { data: company = DEFAULT_COMPANY } = useQuery({
    queryKey: ['public-company'],
    queryFn: fetchPublicCompany,
    retry: false,
  });
  const { data: deliveries = [] } = useQuery({
    queryKey: ['public-deliveries'],
    queryFn: fetchPublicDeliveries,
    retry: false,
  });
  const { data: promotionPackages = [] } = useQuery({
    queryKey: ['public-promotion-packages', 'featured'],
    queryFn: fetchPublicPromotionPackages,
    retry: false,
  });

  const deliveryImages: GalleryImage[] = deliveries
    .flatMap((delivery) =>
      delivery.imageUrls.map((src) => ({
        src,
        title: delivery.itemsDelivered || 'ผลงานของเรา',
        subtitle: `${fDate(delivery.deliveryDate)} · ภาพบรรยากาศงาน`,
      }))
    )
    .slice(0, 6);
  const galleryImages: GalleryImage[] = deliveryImages.length
    ? deliveryImages
    : FALLBACK_GALLERY.map((src) => ({ src, title: 'ตัวอย่างผลงานของเรา' }));

  return (
    <Box component="main" sx={{ overflow: 'hidden', bgcolor: 'common.white' }}>
      <Box
        component="section"
        sx={{ minHeight: { xs: 760, md: 820 }, position: 'relative', bgcolor: '#071d15' }}
      >
        <Carousel
          carousel={heroCarousel}
          sx={{ m: 0, inset: 0, width: 1, height: 1, position: 'absolute' }}
          slotProps={{ container: { height: 1 }, slide: { height: 1 } }}
        >
          {HERO_IMAGES.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt={`บรรยากาศผลงาน ${index + 1}`}
              visibleByDefault
              disablePlaceholder
              sx={{ width: 1, height: 1 }}
            />
          ))}
        </Carousel>
        <Box
          sx={{
            inset: 0,
            position: 'absolute',
            background:
              'linear-gradient(90deg, rgba(4,28,19,0.94) 0%, rgba(4,28,19,0.72) 48%, rgba(4,28,19,0.18) 100%), linear-gradient(0deg, rgba(4,28,19,0.55), transparent 55%)',
          }}
        />
        <Box
          sx={{
            mx: 'auto',
            px: { xs: 2.5, sm: 4, md: 8 },
            pt: { xs: 18, md: 21 },
            pb: 9,
            maxWidth: 1280,
            minHeight: 'inherit',
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
          }}
        >
          <Box sx={{ maxWidth: 760, color: 'common.white' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <Box sx={{ width: 46, height: 2, bgcolor: 'secondary.main' }} />
              <Typography
                variant="overline"
                sx={{ color: 'secondary.light', fontWeight: 800, letterSpacing: 2.2 }}
              >
                {company.nameEn}
              </Typography>
            </Stack>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 50, sm: 68, md: 84 },
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: -2,
              }}
            >
              ให้ทุกช่วงเวลาสำคัญ
              <Box component="span" sx={{ display: 'block', color: 'secondary.light' }}>
                งดงามในแบบของคุณ
              </Box>
            </Typography>
            <Typography
              sx={{
                mt: 3,
                maxWidth: 620,
                color: 'rgba(255,255,255,0.78)',
                fontSize: 18,
                lineHeight: 1.8,
              }}
            >
              เราดูแลงานแต่ง งานบุญ และทุกโอกาสพิเศษ ตั้งแต่การวางแนวคิด ออกแบบ
              ไปจนถึงดูแลรายละเอียดในวันจริง
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
              <Button
                component={RouterLink}
                href={paths.promotionPackages.root}
                size="large"
                variant="contained"
                color="secondary"
                endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                sx={{ px: 3.5 }}
              >
                ดูแพ็กเกจและโปรโมชั่น
              </Button>
              <Button
                component={RouterLink}
                href={paths.jobQueue}
                size="large"
                variant="outlined"
                sx={{ px: 3.5, color: 'common.white', borderColor: 'rgba(255,255,255,0.48)' }}
              >
                ตรวจสอบคิวงาน
              </Button>
            </Stack>
          </Box>
          <Stack
            spacing={1.2}
            sx={{
              right: 64,
              bottom: 64,
              display: { xs: 'none', md: 'flex' },
              position: 'absolute',
            }}
          >
            {HERO_IMAGES.map((_, index) => (
              <Box
                key={index}
                component="button"
                type="button"
                aria-label={`ภาพสไลด์ ${index + 1}`}
                onClick={() => heroCarousel.dots.onClickDot(index)}
                sx={{
                  p: 0,
                  width: index === heroCarousel.dots.selectedIndex ? 54 : 20,
                  height: 3,
                  border: 0,
                  cursor: 'pointer',
                  bgcolor:
                    index === heroCarousel.dots.selectedIndex ? 'secondary.main' : 'grey.500',
                  transition: 'width 180ms ease',
                }}
              />
            ))}
          </Stack>
        </Box>
      </Box>

      <Box component="section" sx={{ px: { xs: 2.5, md: 8 }, position: 'relative', zIndex: 2 }}>
        <Box
          sx={{
            mx: 'auto',
            mt: { xs: -4, md: -6 },
            maxWidth: 1280,
            display: 'grid',
            overflow: 'hidden',
            borderRadius: 2,
            bgcolor: 'common.white',
            boxShadow: '0 24px 70px rgba(5,37,24,0.14)',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          }}
        >
          {HIGHLIGHTS.map((item, index) => (
            <Stack
              key={item.title}
              direction="row"
              spacing={2}
              sx={{
                p: { xs: 3, md: 4 },
                borderBottom: { xs: index < 2 ? '1px solid' : 0, md: 0 },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  display: 'grid',
                  borderRadius: 1.5,
                  placeItems: 'center',
                  color: 'primary.main',
                  bgcolor: 'secondary.lighter',
                }}
              >
                <Iconify icon={item.icon as any} width={26} />
              </Box>
              <Box>
                <Typography variant="h6">{item.title}</Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 0.75, color: 'text.secondary', lineHeight: 1.7 }}
                >
                  {item.body}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Box>
      </Box>

      {promotionPackages.length > 0 && (
        <Box component="section" sx={{ px: { xs: 2.5, md: 8 }, py: { xs: 9, md: 14 } }}>
          <Box sx={{ mx: 'auto', maxWidth: 1280 }}>
            <SectionHeading
              eyebrow="SELECTED PACKAGES"
              title="แพ็กเกจที่ออกแบบมาเพื่อวันสำคัญ"
              description="เลือกแพ็กเกจที่เหมาะกับรูปแบบงาน และดูรายละเอียดบริการทั้งหมดได้ในคลิกเดียว"
              action={
                <Button
                  component={RouterLink}
                  href={paths.promotionPackages.root}
                  color="inherit"
                  endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                >
                  ดูทั้งหมด
                </Button>
              }
            />
            <Box
              sx={{
                mt: 5,
                display: 'grid',
                gap: 3,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              }}
            >
              {promotionPackages.map((item, index) => (
                <Box
                  key={item.id}
                  component={RouterLink}
                  href={paths.promotionPackages.details(item.id)}
                  sx={{
                    minHeight: 440,
                    overflow: 'hidden',
                    color: 'common.white',
                    borderRadius: 2,
                    position: 'relative',
                    textDecoration: 'none',
                    boxShadow: '0 16px 45px rgba(5,37,24,0.12)',
                    '&:hover img': { transform: 'scale(1.05)' },
                    '&:focus-visible': { outline: '3px solid', outlineColor: 'secondary.main' },
                  }}
                >
                  <Image
                    alt={item.name}
                    src={item.imageUrl || HERO_IMAGES[index % HERO_IMAGES.length]}
                    sx={{
                      inset: 0,
                      width: 1,
                      height: 1,
                      position: 'absolute',
                      '& img': { transition: 'transform 350ms ease' },
                    }}
                  />
                  <Box
                    sx={{
                      inset: 0,
                      position: 'absolute',
                      background:
                        'linear-gradient(180deg, transparent 25%, rgba(4,28,19,0.92) 100%)',
                    }}
                  />
                  <Stack sx={{ inset: 0, p: 3, position: 'absolute', justifyContent: 'flex-end' }}>
                    <Typography variant="h4">{item.name}</Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.72)' }}>
                      {item.items.length} รายการบริการ
                    </Typography>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mt: 2 }}
                    >
                      <Typography variant="h4" sx={{ color: 'secondary.light' }}>
                        {fBaht(item.promotionPrice)}
                      </Typography>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          display: 'grid',
                          borderRadius: '50%',
                          placeItems: 'center',
                          bgcolor: 'common.white',
                          color: 'primary.main',
                        }}
                      >
                        <Iconify icon="eva:arrow-ios-forward-fill" />
                      </Box>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      <Box
        component="section"
        sx={{ px: { xs: 2.5, md: 8 }, py: { xs: 9, md: 14 }, bgcolor: '#f4f1e9' }}
      >
        <Box sx={{ mx: 'auto', maxWidth: 1280 }}>
          <SectionHeading
            eyebrow="OUR PORTFOLIO"
            title="รายละเอียดที่เปลี่ยนงานหนึ่งงานให้เป็นความทรงจำ"
            description="ชมบรรยากาศและรายละเอียดจากงานจริงที่เราได้รับความไว้วางใจให้ดูแล"
          />
          <Box
            sx={{
              mt: 5,
              display: 'grid',
              gap: 2,
              gridAutoRows: { xs: 220, md: 260 },
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            }}
          >
            {galleryImages.map((image, index) => (
              <Box
                key={`${image.src}-${index}`}
                component="button"
                type="button"
                aria-label={`ดูภาพ ${image.title}`}
                onClick={() => setSelectedImage(image)}
                sx={{
                  p: 0,
                  border: 0,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  borderRadius: 1.5,
                  position: 'relative',
                  gridColumn: { md: index === 0 ? 'span 2' : 'span 1' },
                  gridRow: { md: index === 0 ? 'span 2' : 'span 1' },
                  '&:hover img': { transform: 'scale(1.05)' },
                  '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main' },
                }}
              >
                <Image
                  src={image.src}
                  alt={image.title}
                  sx={{ width: 1, height: 1, '& img': { transition: 'transform 300ms ease' } }}
                />
                <Box
                  sx={{
                    inset: 0,
                    p: 2.5,
                    display: 'flex',
                    color: 'common.white',
                    textAlign: 'left',
                    position: 'absolute',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    background: 'linear-gradient(180deg, transparent 45%, rgba(4,28,19,0.76) 100%)',
                  }}
                >
                  <Typography variant="subtitle1">{image.title}</Typography>
                  {image.subtitle && <Typography variant="caption">{image.subtitle}</Typography>}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box component="section" sx={{ px: { xs: 2.5, md: 8 }, py: { xs: 9, md: 14 } }}>
        <Box
          sx={{
            mx: 'auto',
            gap: { xs: 5, md: 9 },
            maxWidth: 1280,
            display: 'grid',
            alignItems: 'center',
            gridTemplateColumns: { xs: '1fr', md: '1fr 0.9fr' },
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Image
              src="/assets/mee-bunkoon/bg-1.jpg"
              alt="ทีมงานมีบุญคุณ แกลเลอรี่"
              ratio="4/3"
              sx={{ borderRadius: 2 }}
            />
            <Box
              sx={{
                right: { xs: 16, md: -28 },
                bottom: { xs: 16, md: -28 },
                p: 2.5,
                maxWidth: 220,
                borderRadius: 1.5,
                color: 'common.white',
                position: 'absolute',
                bgcolor: 'primary.main',
                boxShadow: 12,
              }}
            >
              <Typography variant="h4">ใส่ใจทุกขั้นตอน</Typography>
              <Typography variant="body2" sx={{ mt: 0.75, color: 'rgba(255,255,255,0.7)' }}>
                ตั้งแต่แนวคิดแรกจนถึงวันส่งมอบงาน
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'secondary.dark', fontWeight: 800, letterSpacing: 2 }}
            >
              ABOUT US
            </Typography>
            <Typography variant="h2" sx={{ mt: 1.5 }}>
              งานที่ดี เริ่มจากการฟังและเข้าใจ
            </Typography>
            <Typography sx={{ mt: 3, color: 'text.secondary', lineHeight: 1.9 }}>
              ทุกงานมีเรื่องราวและความต้องการที่แตกต่าง เราจึงเริ่มจากการพูดคุย วางแผน
              และออกแบบรายละเอียดให้เหมาะกับเจ้าของงานจริง ๆ
              เพื่อให้ภาพที่คุณคิดไว้กลายเป็นบรรยากาศที่สัมผัสได้ในวันสำคัญ
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 3 }}>
              {[
                'ให้คำปรึกษาและวางแผนรูปแบบงาน',
                'ออกแบบตามงบประมาณและพื้นที่',
                'ทีมงานดูแลและประสานงานหน้างาน',
              ].map((text) => (
                <Stack key={text} direction="row" spacing={1.2} alignItems="center">
                  <Iconify icon="solar:check-circle-bold" color="success.main" />
                  <Typography>{text}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>

      <Box component="section" sx={{ px: { xs: 2.5, md: 8 }, pb: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            mx: 'auto',
            px: { xs: 3, md: 7 },
            py: { xs: 6, md: 8 },
            maxWidth: 1280,
            overflow: 'hidden',
            color: 'common.white',
            borderRadius: 2.5,
            position: 'relative',
            bgcolor: 'primary.main',
          }}
        >
          <Box sx={{ zIndex: 1, maxWidth: 760, position: 'relative' }}>
            <Typography variant="overline" sx={{ color: 'secondary.light', letterSpacing: 2 }}>
              LET&apos;S CREATE TOGETHER
            </Typography>
            <Typography variant="h2" sx={{ mt: 1.5 }}>
              พร้อมเริ่มต้นวางแผนงานสำคัญของคุณหรือยัง?
            </Typography>
            <Typography sx={{ mt: 2, color: 'rgba(255,255,255,0.72)', lineHeight: 1.8 }}>
              พูดคุยกับเราเพื่อเลือกแพ็กเกจ เช็กวันว่าง และออกแบบรูปแบบงานที่เหมาะกับคุณ
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
              <Button
                component="a"
                href={`tel:${company.phone.replace(/[^0-9+]/g, '')}`}
                size="large"
                color="secondary"
                variant="contained"
                startIcon={<Iconify icon="solar:phone-bold" />}
              >
                โทร {company.phone}
              </Button>
              <Button
                component={RouterLink}
                href={paths.jobQueue}
                size="large"
                variant="outlined"
                sx={{ color: 'common.white', borderColor: 'rgba(255,255,255,0.45)' }}
              >
                ดูคิวงาน
              </Button>
            </Stack>
          </Box>
          <Box
            sx={{
              width: 360,
              height: 360,
              right: -80,
              bottom: -180,
              opacity: 0.12,
              borderRadius: '50%',
              position: 'absolute',
              border: '70px solid',
              borderColor: 'secondary.light',
            }}
          />
        </Box>
      </Box>

      <Dialog
        fullWidth
        maxWidth="md"
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        slotProps={{ paper: { sx: { overflow: 'hidden', borderRadius: 2, bgcolor: '#071d15' } } }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2.5, py: 1.5, color: 'common.white' }}
        >
          <Box>
            <Typography variant="subtitle1">{selectedImage?.title}</Typography>
            {selectedImage?.subtitle && (
              <Typography variant="caption">{selectedImage.subtitle}</Typography>
            )}
          </Box>
          <IconButton
            aria-label="ปิดรูปภาพ"
            onClick={() => setSelectedImage(null)}
            sx={{ color: 'inherit' }}
          >
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
        <DialogContent sx={{ p: 0 }}>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage.src}
              alt={selectedImage.title}
              sx={{ width: 1, maxHeight: '78vh', display: 'block', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={3}
      alignItems={{ md: 'flex-end' }}
      justifyContent="space-between"
    >
      <Box sx={{ maxWidth: 780 }}>
        <Typography
          variant="overline"
          sx={{ color: 'secondary.dark', fontWeight: 800, letterSpacing: 2 }}
        >
          {eyebrow}
        </Typography>
        <Typography variant="h2" sx={{ mt: 1 }}>
          {title}
        </Typography>
        <Typography sx={{ mt: 1.5, color: 'text.secondary', lineHeight: 1.8 }}>
          {description}
        </Typography>
      </Box>
      {action}
    </Stack>
  );
}
