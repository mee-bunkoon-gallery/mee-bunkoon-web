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

const DEFAULT_COMPANY = {
  name: 'มีบุญคุณ แกลเลอรี่',
  nameEn: 'MEE BUNKOON GALLERY',
  address: 'บ้านเหล่า ตำบลเม็กดำ พยัคฆภูมิพิสัย จังหวัดมหาสารคาม',
  phone: '098-630-4174',
  logoUrl: null as string | null,
};

type PublicCompany = typeof DEFAULT_COMPANY;
type GalleryImage = { title: string; subtitle?: string; src: string; album?: string[] };
type PublicDelivery = {
  id: string;
  jobId: string;
  jobTitle: string;
  deliveryNo: string;
  deliveryDate: string;
  itemsDelivered: string | null;
  imageUrls: string[];
};
type PortfolioWork = {
  id: string;
  title: string;
  subtitle: string;
  images: string[];
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

  const portfolioWorks: PortfolioWork[] = deliveries
    .filter((delivery) => delivery.imageUrls.length > 0)
    .map((delivery) => ({
      id: delivery.id,
      title: delivery.jobTitle || delivery.itemsDelivered || 'ผลงานของเรา',
      subtitle: `${fDate(delivery.deliveryDate)} · ${delivery.deliveryNo}`,
      images: delivery.imageUrls.slice(0, 5),
    }))
    .slice(0, 6);

  const galleryImages: GalleryImage[] = portfolioWorks
    .flatMap((work) =>
      work.images.map((src) => ({
        src,
        title: work.title,
        subtitle: work.subtitle,
        album: work.images,
      }))
    )
    .slice(0, 6);

  return (
    <Box
      component="main"
      sx={{
        width: 1,
        overflow: 'hidden',
        bgcolor: '#fffdf9',
      }}
    >
      <Box
        component="section"
        sx={{ minHeight: { xs: 700, md: 760 }, position: 'relative', bgcolor: '#fffdf9' }}
      >
        <Carousel
          carousel={heroCarousel}
          sx={{
            m: 0,
            top: { xs: 96, md: 112 },
            right: { xs: 16, sm: 32, md: 64 },
            bottom: { xs: 32, md: 48 },
            left: { xs: 16, sm: 32, md: 64 },
            width: 'auto',
            height: 'auto',
            overflow: 'hidden',
            borderRadius: { xs: 2.5, md: 4 },
            position: 'absolute',
            boxShadow: '0 28px 70px rgba(56,45,24,0.16)',
          }}
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
            top: { xs: 96, md: 112 },
            right: { xs: 16, sm: 32, md: 64 },
            bottom: { xs: 32, md: 48 },
            left: { xs: 16, sm: 32, md: 64 },
            overflow: 'hidden',
            borderRadius: { xs: 2.5, md: 4 },
            position: 'absolute',
            background:
              'linear-gradient(90deg, rgba(23,18,10,0.78) 0%, rgba(23,18,10,0.44) 48%, rgba(23,18,10,0.12) 100%), linear-gradient(0deg, rgba(23,18,10,0.42), transparent 55%)',
          }}
        />
        <Box
          sx={{
            mx: 'auto',
            px: { xs: 5, sm: 8, md: 13 },
            pt: { xs: 17, md: 19 },
            pb: { xs: 7, md: 8 },
            maxWidth: 1440,
            minHeight: 'inherit',
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
          }}
        >
          <Box sx={{ zIndex: 1, maxWidth: 720, color: 'common.white' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
              <Box sx={{ width: 46, height: 2, bgcolor: 'secondary.main' }} />
              <Typography
                variant="overline"
                sx={{ color: 'secondary.light', fontWeight: 800, letterSpacing: 2.6 }}
              >
                {company.nameEn}
              </Typography>
            </Stack>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 43, sm: 64, md: 78 },
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: -1.5,
              }}
            >
              ให้ทุกช่วงเวลาสำคัญ
              <Box
                component="span"
                sx={{
                  display: 'block',
                  color: 'secondary.light',
                  background: 'linear-gradient(110deg, #f4d98f, #fff1bd 52%, #d7b66d)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                งดงามในแบบของคุณ
              </Box>
            </Typography>
            <Typography
              sx={{
                mt: 3,
                maxWidth: 620,
                color: 'rgba(255,255,255,0.8)',
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
                sx={{ px: 3.5, color: '#33240b', boxShadow: '0 12px 30px rgba(0,0,0,0.18)' }}
              >
                ดูแพ็กเกจและโปรโมชั่น
              </Button>
              <Button
                component={RouterLink}
                href={paths.jobQueue}
                size="large"
                variant="outlined"
                sx={{ px: 3.5, color: 'common.white', borderColor: 'rgba(255,255,255,0.58)' }}
              >
                ตรวจสอบคิวงาน
              </Button>
            </Stack>
          </Box>
          <Stack
            spacing={1.2}
            sx={{
              right: 96,
              bottom: 76,
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
                    index === heroCarousel.dots.selectedIndex ? 'secondary.light' : 'grey.400',
                  transition: 'width 180ms ease',
                }}
              />
            ))}
          </Stack>
        </Box>
      </Box>

      <Box
        component="section"
        sx={{ px: { xs: 2.5, md: 8 }, py: { xs: 6, md: 10 }, position: 'relative', zIndex: 2 }}
      >
        <Box
          sx={{
            mx: 'auto',
            maxWidth: 1280,
            display: 'grid',
            gap: { xs: 4, md: 7 },
            alignItems: 'center',
            gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' },
          }}
        >
          <Box>
            <Typography variant="overline" sx={{ color: 'secondary.dark', letterSpacing: 2 }}>
              WHY CHOOSE US
            </Typography>
            <Typography variant="h2" sx={{ mt: 1.5 }}>
              เพราะทุกงานสำคัญ ควรมีรายละเอียดที่พิเศษ
            </Typography>
            <Typography sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.9 }}>
              เราผสานประสบการณ์ ความคิดสร้างสรรค์ และการดูแลอย่างใกล้ชิด
              เพื่อเปลี่ยนภาพในใจให้กลายเป็นบรรยากาศจริงที่น่าจดจำ
            </Typography>
          </Box>
          <Stack spacing={1.5}>
            {HIGHLIGHTS.map((item) => (
              <Stack
                key={item.title}
                direction="row"
                spacing={2}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: '#f8f3e8',
                  border: '1px solid rgba(181,137,55,0.2)',
                }}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    flexShrink: 0,
                    display: 'grid',
                    borderRadius: 1.5,
                    placeItems: 'center',
                    color: 'secondary.dark',
                    bgcolor: 'common.white',
                    border: '1px solid rgba(181,137,55,0.22)',
                  }}
                >
                  <Iconify icon={item.icon as any} width={26} />
                </Box>
                <Box>
                  <Typography variant="h6">{item.title}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                    {item.body}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>

      {promotionPackages.length > 0 && (
        <Box
          component="section"
          sx={{ px: { xs: 2.5, md: 8 }, py: { xs: 9, md: 14 }, bgcolor: '#fffdf9' }}
        >
          <Box
            sx={{
              mx: 'auto',
              p: { xs: 2.5, sm: 4, md: 5 },
              maxWidth: 1280,
              borderRadius: { xs: 2.5, md: 4 },
              bgcolor: '#f8f3e8',
              border: '1px solid rgba(181,137,55,0.16)',
            }}
          >
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
                mt: 4,
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
                    border: '1px solid rgba(181,137,55,0.22)',
                    boxShadow: '0 18px 48px rgba(96,70,25,0.12)',
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

      {galleryImages.length > 0 && (
        <Box
          component="section"
          sx={{ px: { xs: 2.5, md: 8 }, py: { xs: 9, md: 14 }, bgcolor: '#f8f3e8' }}
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
                  aria-label={`ดูอัลบั้ม ${image.title}`}
                  onClick={() => setSelectedImage(image)}
                  sx={{
                    p: 0,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    borderRadius: 1.5,
                    border: '1px solid rgba(181,137,55,0.18)',
                    position: 'relative',
                    gridColumn: { md: index === 0 ? 'span 2' : 'span 1' },
                    gridRow: { md: index === 0 ? 'span 2' : 'span 1' },
                    '&:hover img': { transform: 'scale(1.05)' },
                    '&:focus-visible': { outline: '3px solid', outlineColor: 'secondary.main' },
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
                      background:
                        'linear-gradient(180deg, transparent 45%, rgba(23,18,10,0.78) 100%)',
                    }}
                  >
                    <Typography variant="subtitle1">{image.title}</Typography>
                    {image.subtitle && <Typography variant="caption">{image.subtitle}</Typography>}
                    {!!image.album?.length && (
                      <Typography variant="caption" sx={{ mt: 0.5, color: 'secondary.light' }}>
                        ดูอัลบั้ม {image.album.length} ภาพ
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      <Box
        component="section"
        sx={{ px: { xs: 2.5, md: 8 }, py: { xs: 9, md: 14 }, bgcolor: '#fffdf9' }}
      >
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
              sx={{ borderRadius: 2, border: '1px solid rgba(181,137,55,0.22)' }}
            />
            <Box
              sx={{
                right: { xs: 16, md: -28 },
                bottom: { xs: 16, md: -28 },
                p: 2.5,
                maxWidth: 220,
                borderRadius: 1.5,
                color: '#33240b',
                position: 'absolute',
                bgcolor: 'secondary.light',
                border: '1px solid rgba(155,107,32,0.25)',
                boxShadow: '0 16px 36px rgba(96,70,25,0.18)',
              }}
            >
              <Typography variant="h4">ใส่ใจทุกขั้นตอน</Typography>
              <Typography variant="body2" sx={{ mt: 0.75, color: 'rgba(51,36,11,0.7)' }}>
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

      <Box
        component="section"
        sx={{ px: { xs: 2.5, md: 8 }, pb: { xs: 10, md: 20 }, bgcolor: '#fffdf9' }}
      >
        <Box
          sx={{
            mx: 'auto',
            px: { xs: 3, md: 7 },
            py: { xs: 6, md: 8 },
            maxWidth: 1280,
            overflow: 'hidden',
            color: 'text.primary',
            borderRadius: 2.5,
            position: 'relative',
            border: '1px solid rgba(181,137,55,0.28)',
            background:
              'radial-gradient(circle at 90% 20%, rgba(215,182,109,0.28), transparent 30%), linear-gradient(135deg, #fffdf9, #f6ecd6)',
            boxShadow: '0 24px 60px rgba(96,70,25,0.1)',
          }}
        >
          <Box sx={{ zIndex: 1, maxWidth: 760, position: 'relative' }}>
            <Typography variant="overline" sx={{ color: 'secondary.light', letterSpacing: 2 }}>
              LET&apos;S CREATE TOGETHER
            </Typography>
            <Typography variant="h2" sx={{ mt: 1.5 }}>
              พร้อมเริ่มต้นวางแผนงานสำคัญของคุณหรือยัง?
            </Typography>
            <Typography sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.8 }}>
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
                sx={{ color: 'text.primary', borderColor: 'rgba(155,107,32,0.42)' }}
              >
                ดูคิวงาน
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Dialog
        fullWidth
        maxWidth="lg"
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
              sx={{
                width: 1,
                height: { xs: '52vh', md: '68vh' },
                display: 'block',
                objectFit: 'contain',
              }}
            />
          )}
          {!!selectedImage?.album?.length && (
            <Box
              sx={{
                gap: 1,
                p: 1.5,
                display: 'flex',
                overflowX: 'auto',
                borderTop: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {selectedImage.album.map((src, index) => {
                const isSelected = src === selectedImage.src;

                return (
                  <Box
                    key={src}
                    component="button"
                    type="button"
                    aria-label={`เลือกดูภาพที่ ${index + 1}`}
                    onClick={() =>
                      setSelectedImage((current) => (current ? { ...current, src } : current))
                    }
                    sx={{
                      p: 0,
                      width: { xs: 72, sm: 96 },
                      height: { xs: 54, sm: 68 },
                      border: '2px solid',
                      flexShrink: 0,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      borderRadius: 1,
                      borderColor: isSelected ? 'secondary.main' : 'transparent',
                      opacity: isSelected ? 1 : 0.58,
                      transition: 'opacity 180ms ease, border-color 180ms ease',
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <Box
                      component="img"
                      src={src}
                      alt={`${selectedImage.title} ภาพที่ ${index + 1}`}
                      sx={{ width: 1, height: 1, display: 'block', objectFit: 'cover' }}
                    />
                  </Box>
                );
              })}
            </Box>
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
