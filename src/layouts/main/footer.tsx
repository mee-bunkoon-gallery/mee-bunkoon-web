'use client';

import type { Breakpoint } from '@mui/material/styles';

import { useState, useEffect } from 'react';
import { RiLink, RiTiktokFill, RiFacebookFill, RiInstagramFill } from '@remixicon/react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _socials } from 'src/_mock';

import { CompanyLogo } from 'src/components/logo';

// ----------------------------------------------------------------------

const DEFAULT_COMPANY = {
  name: 'มีบุญคุณ แกลเลอรี่',
  nameEn: 'MEE BUNKOON GALLERY',
};

function useCompany() {
  const [company, setCompany] = useState(DEFAULT_COMPANY);

  useEffect(() => {
    fetch('/api/public/company/', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((payload) => {
        if (payload?.company) {
          setCompany({
            name: payload.company.name || DEFAULT_COMPANY.name,
            nameEn: payload.company.nameEn || DEFAULT_COMPANY.nameEn,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  return company;
}

const getLinks = (companyName: string) => [
  {
    headline: 'เมนู',
    children: [
      { name: 'หน้าแรก', href: '/' },
      { name: 'คิวงาน', href: paths.jobQueue },
      { name: 'โปรโมชั่น', href: paths.promotionPackages.root },
    ],
  },
  {
    headline: 'ข้อมูล',
    children: [
      { name: 'เกี่ยวกับเรา', href: paths.about },
      { name: 'ติดต่อเรา', href: paths.contact },
    ],
  },
  {
    headline: 'ติดต่อ',
    children: [{ name: companyName, href: paths.contact }],
  },
];

const SOCIAL_ICONS = {
  facebook: RiFacebookFill,
  instagram: RiInstagramFill,
  tiktok: RiTiktokFill,
} as const;

// ----------------------------------------------------------------------

const FooterRoot = styled('footer')(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  color: theme.palette.text.primary,
  backgroundColor: '#ffffff',
}));

export type FooterProps = React.ComponentProps<typeof FooterRoot>;

export function Footer({
  sx,
  layoutQuery = 'md',
  ...other
}: FooterProps & { layoutQuery?: Breakpoint }) {
  const company = useCompany();
  const links = getLinks(company.name);

  return (
    <FooterRoot sx={sx} {...other}>
      <Divider />

      <Container
        sx={(theme) => ({
          width: { xs: 'calc(100% - 40px)', md: 'calc(100% - 128px)' },
          maxWidth: '1280px !important',
          px: '0 !important',
          pb: { xs: 3, md: 4 },
          pt: { xs: 5, sm: 7, md: 4 },
          textAlign: 'center',
          [theme.breakpoints.up(layoutQuery)]: { textAlign: 'unset' },
        })}
      >
        <Grid
          container
          sx={[
            (theme) => ({
              rowGap: { xs: 4, md: 0 },
              justifyContent: 'center',
              [theme.breakpoints.up(layoutQuery)]: { justifyContent: 'space-between' },
            }),
          ]}
        >
          <Grid size={{ xs: 12, [layoutQuery]: 4 }}>
            <Box
              sx={(theme) => ({
                display: 'flex',
                justifyContent: 'center',
                [theme.breakpoints.up(layoutQuery)]: { justifyContent: 'flex-start' },
              })}
            >
              <CompanyLogo sx={{ width: 100, height: 100 }} />
            </Box>
            <Typography
              variant="body2"
              sx={(theme) => ({
                mt: 2,
                mx: 'auto',
                maxWidth: 340,
                opacity: 0.72,
                lineHeight: 1.8,
                [theme.breakpoints.up(layoutQuery)]: { mx: 'unset' },
              })}
            >
              {company.name} รับจัดงานด้วยความใส่ใจ เพื่อทุกช่วงเวลาสำคัญของคุณ
            </Typography>

            <Box
              sx={(theme) => ({
                gap: 0.75,
                mt: 2,
                display: 'flex',
                justifyContent: 'center',
                [theme.breakpoints.up(layoutQuery)]: { justifyContent: 'flex-start' },
              })}
            >
              {_socials.map((social) => (
                <IconButton
                  key={social.label}
                  component="a"
                  href={social.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{
                    color: 'primary.main',
                    bgcolor: 'common.white',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'primary.main', color: 'common.white' },
                  }}
                >
                  <Box
                    component={SOCIAL_ICONS[social.value as keyof typeof SOCIAL_ICONS] ?? RiLink}
                  />
                </IconButton>
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, [layoutQuery]: 6 }}>
            <Box
              sx={(theme) => ({
                gap: { xs: 3, sm: 4 },
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, 1fr)' },
              })}
            >
              {links.map((list, index) => (
                <Box
                  key={list.headline}
                  sx={(theme) => ({
                    gap: 1.25,
                    width: 1,
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    ...(index === links.length - 1 && {
                      gridColumn: { xs: '1 / -1', sm: 'auto' },
                    }),
                    [theme.breakpoints.up(layoutQuery)]: { alignItems: 'flex-start' },
                  })}
                >
                  <Typography component="div" variant="overline" sx={{ color: 'primary.main' }}>
                    {list.headline}
                  </Typography>

                  {list.children.map((link) => (
                    <Link
                      key={link.name}
                      component={RouterLink}
                      href={link.href}
                      color="text.secondary"
                      variant="body2"
                      underline="none"
                      sx={{ '&:hover': { color: 'primary.main' } }}
                    >
                      {link.name}
                    </Link>
                  ))}
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: { xs: 4, md: 6 }, pt: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            © {new Date().getFullYear()} {company.name} สงวนลิขสิทธิ์
          </Typography>
        </Box>
      </Container>
    </FooterRoot>
  );
}

// ----------------------------------------------------------------------

export function HomeFooter({ sx, ...other }: FooterProps) {
  const theme = useTheme();
  const company = useCompany();
  return (
    <FooterRoot
      sx={[
        {
          py: 5,
          textAlign: 'center',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Container
        sx={{
          width: { xs: 'calc(100% - 40px)', md: 'calc(100% - 128px)' },
          maxWidth: '1280px !important',
          px: '0 !important',
        }}
      >
        <CompanyLogo sx={{ width: 100, height: 100 }} />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          {_socials.map((social) => (
            <IconButton
              key={social.label}
              component="a"
              href={social.path}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
            >
              <Box component={SOCIAL_ICONS[social.value as keyof typeof SOCIAL_ICONS] ?? RiLink} />
            </IconButton>
          ))}
        </Box>
        <Box sx={{ mt: 1, typography: 'caption', color: theme.palette.primary.main }}>
          © {company.nameEn}
        </Box>
      </Container>
    </FooterRoot>
  );
}
