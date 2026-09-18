'use client';

import { useState } from 'react';
import Fade from 'embla-carousel-fade';
import Autoplay from 'embla-carousel-autoplay';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';

import { fDate } from 'src/utils/format-time';

import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { Carousel, useCarousel } from 'src/components/carousel';

// ----------------------------------------------------------------------

const HERO_IMAGE = [
  '/assets/background/hero-1.jpg',
  '/assets/background/hero-2.jpg',
  '/assets/background/hero-3.jpg',
  // '/assets/background/hero-4.jpg',
  // '/assets/background/hero-5.jpg',
  // '/assets/background/hero-6.jpg',
  // '/assets/background/hero-7.jpg',
].slice(0, 7);
const SCENES_IMAGE = '/assets/mee-bunkoon/hero-3.jpg';
const MEMORIAL_IMAGE = '/assets/mee-bunkoon/hero-1.jpg';
const KRU_IMAGE = '/assets/mee-bunkoon/bg-1.jpg';

const SCENES_1_IMAGE = '/assets/mee-bunkoon/hero-2.jpg';

const DEFAULT_COMPANY = {
  name: 'มีบุญคุณ แกลเลอรี่',
  nameEn: 'MEE BUNKOON GALLERY',
  address: 'บ้านเหล่า ตำบลเม็กดำ พยัคฆภูมิพิสัย จังหวัดมหาสารคาม',
  phone: '098-630-4174',
  logoUrl: null as string | null,
};

type PublicCompany = typeof DEFAULT_COMPANY;

type GalleryImage = {
  title: string;
  src: string;
};

type PublicDelivery = {
  id: string;
  deliveryNo: string;
  deliveryDate: string;
  itemsDelivered: string | null;
  imageUrls: string[];
};

const highlights = [
  {
    icon: '01',
    title: 'รับจัดงานครบวงจร',
    body: 'ดูแลงานแต่ง งานบุญ งานเลี้ยง และกิจกรรมพิเศษ ตั้งแต่เริ่มต้นจนจบงาน',
  },
  {
    icon: '02',
    title: 'ออกแบบให้ตรงใจ',
    body: 'ออกแบบธีม สีสัน ฉาก และองค์ประกอบของงานให้สะท้อนความเป็นคุณ',
  },
  {
    icon: '03',
    title: 'ทีมงานดูแลหน้างาน',
    body: 'ประสานงานและดูแลรายละเอียดหน้างาน เพื่อให้ทุกช่วงเวลาราบรื่น',
  },
];

const ROYAL_IMAGE_ITEMS = [
  {
    title: 'ตัวอย่างผลงานจัดงาน',
    src: '/assets/mee-bunkoon/hero-1.jpg',
  },
  {
    title: 'ตัวอย่างผลงานจัดงาน',
    src: '/assets/mee-bunkoon/hero-2.jpg',
  },
  {
    title: 'ตัวอย่างผลงานจัดงาน',
    src: '/assets/mee-bunkoon/hero-3.jpg',
  },
  {
    title: 'ตัวอย่างผลงานจัดงาน',
    src: '/assets/mee-bunkoon/hero-4.jpg',
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

  const payload = await response.json();
  return payload?.deliveries ?? [];
}

export function HomeView() {
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const heroCarousel = useCarousel({ loop: true, duration: 80 }, [
    Fade(),
    Autoplay({ playOnInit: true, delay: 5000 }),
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

  const deliveryImages = deliveries
    .flatMap((delivery) =>
      delivery.imageUrls.map((src, index) => ({
        src,
        title: delivery.itemsDelivered || 'ผลงานของเรา',
        subtitle: `${fDate(delivery.deliveryDate)} · ภาพบรรยากาศงาน`,
      }))
    )
    .slice(0, 4);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        color: theme.palette.primary.main,
        overflow: 'hidden',
        bgcolor: theme.palette.primary.main,
        fontFamily: "'LINE Seed Sans TH', sans-serif",
      }}
    >
      <Box
        sx={{
          minHeight: { xs: 760, md: 1020 },
          position: 'relative',
          px: { xs: 2.5, md: 8, lg: 13 },
          pt: { xs: 14, md: 19 },
          pb: { xs: 7, md: 6 },
          bgcolor: '#052518',
        }}
      >
        <Carousel
          carousel={heroCarousel}
          sx={{
            m: 0,
            inset: 0,
            width: 1,
            height: 1,
            zIndex: 0,
            position: 'absolute',
          }}
          slotProps={{
            container: { height: 1 },
            slide: { height: 1 },
          }}
        >
          {HERO_IMAGE.map((src, index) => (
            <Image
              key={src}
              alt={`ผลงาน ${company.name} ${index + 1}`}
              src={src}
              visibleByDefault
              disablePlaceholder
              sx={{ width: 1, height: 1 }}
            />
          ))}
        </Carousel>

        <Box
          sx={{
            inset: 0,
            zIndex: 1,
            position: 'absolute',
            pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%,rgba(255, 255, 255, 0.23)  56%, ${theme.palette.secondary.light} 100%),
              linear-gradient(90deg, ${theme.palette.secondary.lighter} 0%, rgba(255, 255, 255, 0.11) 18%, rgba(255, 255, 255, 0.19) 100%),
              linear-gradient(0deg, ${theme.palette.secondary.main}, rgba(0, 44, 106, 0.08))
            `,
          }}
        />

        <Box sx={{ mx: 'auto', maxWidth: 1280, position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              maxWidth: 700,
              alignItems: 'flex-start',
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'center',
            }}
          >
            <Image alt={`โลโก้ ${company.name}`} sx={{ width: 400 }} src="/logo/logo-single.svg" />

            <Typography
              sx={{
                mt: 2,
                color: theme.palette.common.white,
                fontSize: { xs: 48 },
                fontWeight: 800,
                lineHeight: 0.92,
                textTransform: 'uppercase',
              }}
            >
              {company.nameEn}
            </Typography>
            <Typography variant="h2" mt={1} color={theme.palette.common.white}>
              {company.name}
            </Typography>

            <Typography variant="h5" mt={2} color={theme.palette.common.white}>
              {company.address}
            </Typography>

            <Typography variant="h5" mt={2} color={theme.palette.common.white}>
              โทร {company.phone}
            </Typography>
          </Box>

          <Stack
            spacing={1.35}
            sx={{
              top: { xs: 152, md: 170 },
              right: 0,
              width: 120,
              display: { xs: 'none', md: 'flex' },
              position: 'absolute',
              alignItems: 'flex-end',
            }}
          >
            {HERO_IMAGE.map((_, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={1.3}
                alignItems="center"
                sx={{
                  color:
                    index === heroCarousel.dots.selectedIndex
                      ? theme.palette.common.white
                      : theme.palette.common.white,
                  cursor: 'pointer',
                }}
                onClick={() => heroCarousel.dots.onClickDot(index)}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 800 }}>
                  {String(index + 1).padStart(2, '0')}
                </Typography>
                <Box
                  sx={{
                    height: 2,
                    width: index === heroCarousel.dots.selectedIndex ? 78 : 18,
                    bgcolor:
                      index === heroCarousel.dots.selectedIndex
                        ? theme.palette.secondary.dark
                        : theme.palette.secondary.light,
                  }}
                />
              </Stack>
            ))}
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 3, md: 5 }}
            sx={{
              mt: { xs: 19, md: 23 },
              pt: 3,
              borderBottom: '1px solid rgba(234,215,161,0.26)',
              pb: 4,
            }}
          >
            {highlights.map((item) => (
              <Stack key={item.title} direction="row" spacing={2.2} sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: 24,
                    fontWeight: 800,
                    opacity: 0.78,
                    minWidth: 34,
                    lineHeight: 1,
                  }}
                >
                  {item.icon}
                </Typography>
                <Box>
                  <Typography variant="h6">{item.title}</Typography>
                  <Typography variant="body1" sx={{ mt: 0.8 }}>
                    {item.body}
                  </Typography>
                  {/* <Typography
                    variant="subtitle1"
                    sx={{
                      mt: 1.5,
                      color: theme.palette.secondary.main,
                      textTransform: 'uppercase',
                    }}
                  >
                    รากหดกหด
                  </Typography> */}
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          px: { xs: 2.5, md: 8, lg: 13 },
          py: { xs: 7, md: 11 },
          // color: theme.palette.secondary.main,
          backgroundImage: `
            radial-gradient(circle at 50% 8%,  ${theme.palette.secondary.light} 0,  ${theme.palette.secondary.light} 10%),
            linear-gradient(180deg, ${theme.palette.secondary.main} 0, #fefefe 92px, #ffffff 100%)
          `,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            src={MEMORIAL_IMAGE}
            alt="ตัวอย่างผลงานของเรา"
            sx={{
              width: '600px',
              height: '100%',
              display: 'block',
              mx: 'auto',
              filter: 'drop-shadow(0 28px 55px rgba(9,47,33,0.12))',
            }}
          />

          <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 4 }}>
            <Box sx={{ width: '50%' }}>
              <Typography
                variant="h3"
                color="primary"
                sx={{
                  fontStyle: 'italic',
                }}
              >
                เปลี่ยนทุกไอเดียให้เป็นงานที่น่าจดจำ ด้วยการออกแบบที่ใส่ใจในทุกรายละเอียด
              </Typography>

              <Typography
                variant="h4"
                color="primary"
                sx={{
                  fontStyle: 'italic',
                  mt: 3,
                }}
              >
                &quot;เพราะทุกช่วงเวลาสำคัญ ควรได้รับการดูแลเป็นพิเศษ&quot;
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              mt: 3,
              mx: 'auto',
              width: 180,
              height: 4,
              bgcolor: theme.palette.secondary.main,
              opacity: 0.72,
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          px: { xs: 2.5, md: 8, lg: 13 },
          py: { xs: 7, md: 10 },
          minHeight: 800,
          backgroundImage: `
            linear-gradient(0deg, ${theme.palette.common.white} 10%, rgba(252, 252, 252, 0.64) 48%, ${theme.palette.secondary.light} 100%),
            linear-gradient(0deg, rgba(217,181,109,0.1), rgba(217,181,109,0.1)),
            url(${SCENES_1_IMAGE})
          `,
          backgroundSize: 'cover',
          backgroundPosition: '100% 20%',
        }}
      >
        <Box sx={{ mx: 'auto', maxWidth: 1000, textAlign: 'center' }}>
          <Typography variant="h3" color="primary">
            ผลงานที่เราใส่ใจในทุกรายละเอียด
          </Typography>
          <Typography variant="subtitle1" color="primary" sx={{ mt: 1.4, textAlign: 'center' }}>
            เราร่วมวางแผน ออกแบบ และจัดเตรียมทุกองค์ประกอบให้เหมาะกับรูปแบบงาน งบประมาณ
            และความต้องการของคุณ
          </Typography>

          <Box
            sx={{
              mt: 7,
              display: 'grid',
              gap: { xs: 2.2, sm: 2.5 },
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
              },
            }}
          >
            {ROYAL_IMAGE_ITEMS.map((image) => (
              <Box
                key={image.src}
                className="royal-image-button"
                component="button"
                type="button"
                aria-label={`ดูภาพ ${image.title}`}
                onClick={() => setSelectedImage(image)}
                sx={{
                  p: 0,
                  m: 0,
                  border: 0,
                  width: 1,
                  display: 'block',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  borderRadius: 1,
                  bgcolor: 'transparent',
                  position: 'relative',
                  '&::after': {
                    inset: 0,
                    opacity: 0,
                    content: '""',
                    position: 'absolute',
                    transition: 'opacity 180ms ease',
                    background:
                      'linear-gradient(180deg, rgba(253, 253, 253, 0.02) 0%, rgba(255, 255, 255, 0.46) 100%)',
                  },
                  '&:hover::after, &:focus-visible::after': {
                    opacity: 1,
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${theme.palette.secondary.main}`,
                    outlineOffset: 4,
                  },
                  '&:hover .royal-image-preview-icon, &:focus-visible .royal-image-preview-icon': {
                    opacity: 1,
                    transform: 'translate(-50%, -50%) scale(1)',
                  },
                }}
              >
                <Image
                  alt={image.title}
                  src={image.src}
                  ratio="3/4"
                  sx={{
                    width: 1,
                    transition: 'transform 220ms ease',
                    '.royal-image-button:hover > &, .royal-image-button:focus-visible > &': {
                      transform: 'scale(1.04)',
                    },
                  }}
                />
                <Box
                  className="royal-image-preview-icon"
                  sx={{
                    top: '50%',
                    left: '50%',
                    zIndex: 1,
                    width: 52,
                    height: 52,
                    opacity: 0,
                    display: 'grid',
                    borderRadius: '50%',
                    placeItems: 'center',
                    position: 'absolute',
                    color: theme.palette.secondary.main,
                    transform: 'translate(-50%, -50%) scale(0.92)',
                    transition: 'opacity 180ms ease, transform 180ms ease',
                    bgcolor: 'rgba(255, 255, 255, 0.64)',
                    border: '1px solid rgba(234,215,161,0.58)',
                    boxShadow: '0 18px 40px rgba(0,0,0,0.34)',
                  }}
                >
                  <Iconify icon="solar:eye-bold" width={24} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          px: { xs: 2.5, md: 8, lg: 13 },
          py: { xs: 8, md: 12 },
          minHeight: 670,
          backgroundImage: `
            linear-gradient(180deg, ${theme.palette.common.white} 0%, rgba(250, 251, 252, 0.64) 32%, ${theme.palette.common.white} 100%),
            linear-gradient(90deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 249, 250, 0.48) 52%, rgba(254, 254, 254, 0.9) 100%),
            linear-gradient(0deg, rgba(217, 181, 109, 0.1), rgba(217, 181, 109, 0.1)),
            url(${KRU_IMAGE})
          `,
          backgroundSize: 'cover',
          backgroundPosition: '100% 100%',
        }}
      >
        <Box
          sx={{
            mx: 'auto',
            gap: { xs: 6, md: 5 },
            maxWidth: 1280,
            display: 'grid',
            alignItems: 'center',
            gridTemplateColumns: { xs: '1fr', md: '0.88fr 1.12fr' },
          }}
        >
          <Box
            sx={{
              width: 1,
            }}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: 'rgba(234,215,161,0.1)',
                border: '1px solid rgba(234,215,161,0.22)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
              }}
            >
              <Image
                alt="ทีมงานพร้อมดูแลงานของคุณ"
                src={SCENES_IMAGE}
                ratio="4/3"
                sx={{ borderRadius: 1 }}
              />
            </Box>
          </Box>

          <Box>
            <Typography
              component="h2"
              sx={{
                maxWidth: 520,
                fontSize: { xs: 42, sm: 58, md: 60 },
                fontWeight: 800,
                lineHeight: 1.2,
                textTransform: 'uppercase',
              }}
            >
              วางใจให้เราดูแลงานสำคัญของคุณ
            </Typography>

            <Typography
              sx={{
                mt: 4,
                maxWidth: 430,
                lineHeight: 1.75,
              }}
            >
              เริ่มจากการพูดคุยความต้องการ กำหนดรูปแบบและงบประมาณ แล้วให้ทีมงานจัดเตรียมทุกส่วน
              ทั้งสถานที่ ฉาก ดอกไม้ แสง สี เสียง และลำดับงาน
              เพื่อให้วันสำคัญของคุณดำเนินไปอย่างมั่นใจ
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontStyle: 'italic',
                mt: 3,
              }}
            >
              &quot;ครบทุกเรื่องของงาน ในทีมเดียว&quot;
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontStyle: 'italic',
                mt: 3,
              }}
            >
              ตั้งแต่การวางแผน จนถึงการดูแลหน้างาน
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          px: { xs: 2.5, md: 8, lg: 13 },
          py: { xs: 8, md: 12 },
          minHeight: 800,
          backgroundImage: `
            linear-gradient(180deg, ${theme.palette.common.white} 0%, rgba(250, 251, 251, 0.64) 32%, ${theme.palette.common.white} 100%),
            linear-gradient(90deg, rgba(248, 249, 250, 0.94) 0%, rgba(244, 246, 248, 0.48) 52%, rgba(247, 247, 248, 0.9) 100%),
            linear-gradient(0deg, rgba(217, 181, 109, 0.1), rgba(217, 181, 109, 0.1)),
            url(${SCENES_IMAGE})
          `,
          backgroundSize: 'cover',
          backgroundPosition: '100% 100%',
        }}
      >
        <Box
          sx={{
            mx: 'auto',
            gap: { xs: 6, md: 5 },
            maxWidth: 1280,
            display: 'grid',
            alignItems: 'center',
            gridTemplateColumns: { xs: '1fr', md: '0.88fr 1.12fr' },
          }}
        >
          <Box>
            <Typography
              component="h2"
              sx={{
                maxWidth: 520,
                fontSize: { xs: 42, sm: 58, md: 60 },
                fontWeight: 800,
                lineHeight: 1.2,
                textTransform: 'uppercase',
              }}
            >
              ผลงานล่าสุดของเรา
            </Typography>

            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 4.5 }}>
              <Iconify icon="solar:gallery-wide-bold" width={30} />
              <Typography variant="h5" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                ภาพบรรยากาศจากงานที่เราได้ดูแล
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: 4,
                maxWidth: 430,
                fontSize: 13,
                lineHeight: 1.75,
              }}
            >
              ชมตัวอย่างผลงาน การจัดตกแต่ง และรายละเอียดจากงานจริงของเรา
            </Typography>
          </Box>

          <Box
            sx={{
              gap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            }}
          >
            {deliveryImages.map((image, index) => (
              <Box
                key={`${image.src}-${index}`}
                component="button"
                type="button"
                aria-label={`ดูภาพ ${image.title}`}
                onClick={() => setSelectedImage(image)}
                sx={{
                  p: 1,
                  m: 0,
                  border: 0,
                  display: 'block',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: 1.5,
                  bgcolor: 'rgba(234,215,161,0.1)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
                  '&:focus-visible': {
                    outline: `2px solid ${theme.palette.secondary.main}`,
                    outlineOffset: 4,
                  },
                }}
              >
                <Image alt={image.title} src={image.src} ratio="16/9" />

                <Typography
                  sx={{
                    mt: 1.25,
                    px: 0.5,
                    color: theme.palette.secondary.main,
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {image.title}
                </Typography>
                <Typography sx={{ px: 0.5, color: 'text.secondary', fontSize: 12 }}>
                  {image.subtitle}
                </Typography>
              </Box>
            ))}

            {!deliveryImages.length && (
              <Box
                sx={{
                  p: 4,
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  borderRadius: 1.5,
                  color: 'text.secondary',
                  border: '1px dashed rgba(9,47,33,0.28)',
                }}
              >
                กำลังอัปเดตผลงานใหม่เร็ว ๆ นี้
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* <Box
        sx={{
          textAlign: 'center',
          px: { xs: 2.5, md: 8, lg: 13 },
          py: { xs: 8, md: 12 },
          minHeight: 600,
          backgroundImage: `
            linear-gradient(180deg, ${theme.palette.primary.main} 0%, rgba(9,47,33,0.64) 32%, ${theme.palette.primary.main} 100%),
            linear-gradient(90deg, rgba(5,37,24,0.94) 0%, rgba(18,61,43,0.48) 52%, rgba(5,37,24,0.9) 100%),
            linear-gradient(0deg, rgba(217,181,109,0.1), rgba(217,181,109,0.1)),
            url(${SCENES_IMAGE})
          `,
          backgroundSize: 'cover',
          backgroundPosition: '100% 100%',
        }}
      >
        <Typography
          sx={{
            mt: 2,
            color: theme.palette.secondary.main,
            fontSize: { xs: 24, sm: 32, md: 40 },
            fontWeight: 800,
            lineHeight: 0.92,
            textTransform: 'uppercase',
          }}
        >
          ผู้มีส่วนร่วม
        </Typography>
        <Stack
          mt={6}
          sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
          spacing={4}
        >
          <Image alt="Single logo" sx={{ width: 200 }} src="/assets/akhahas-sri/logo-kaitod.png" />
        </Stack>
      </Box> */}

      <Dialog
        fullWidth
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        slotProps={{
          paper: {
            sx: {
              overflow: 'hidden',
              bgcolor: theme.palette.primary.main,
              borderRadius: 1.5,
              border: '1px solid rgba(234,215,161,0.24)',
            },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.25,
            gap: 1.5,
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.secondary.main,
            justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 800 }}>{selectedImage?.title}</Typography>

          <IconButton onClick={() => setSelectedImage(null)} sx={{ color: 'inherit' }}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>

        <DialogContent sx={{ py: 3, bgcolor: theme.palette.primary.main, width: 'auto' }}>
          {selectedImage && (
            <Box
              component="img"
              alt={selectedImage.title}
              src={selectedImage.src}
              sx={{
                width: 1,
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
                maxHeight: { xs: '78vh', md: '82vh' },
                bgcolor: theme.palette.primary.main,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* <Stack
        component="footer"
        direction="row"
        spacing={4}
        justifyContent="center"
        sx={{ pb: 7, color: theme.palette.secondary.main, bgcolor: theme.palette.primary.main }}
      >
        {_socials.map((social) => (
          <IconButton key={social.label}>
            {social.value === 'twitter' && <Iconify icon="socials:twitter" />}
            {social.value === 'facebook' && <Iconify icon="socials:facebook" />}
            {social.value === 'instagram' && <Iconify icon="socials:instagram" />}
            {social.value === 'linkedin' && <Iconify icon="socials:linkedin" />}
          </IconButton>
        ))}
      </Stack> */}
    </Box>
  );
}
