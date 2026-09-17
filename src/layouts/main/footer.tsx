'use client';

import type { Breakpoint } from '@mui/material/styles';

import { useState, useEffect } from 'react';

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

import { Iconify } from 'src/components/iconify';
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

// ----------------------------------------------------------------------

const FooterRoot = styled('footer')(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.common.white,
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
          pb: 5,
          pt: 10,
          textAlign: 'center',
          [theme.breakpoints.up(layoutQuery)]: { textAlign: 'unset' },
        })}
      >
        <CompanyLogo />

        <Grid
          container
          sx={[
            (theme) => ({
              mt: 3,
              justifyContent: 'center',
              [theme.breakpoints.up(layoutQuery)]: { justifyContent: 'space-between' },
            }),
          ]}
        >
          <Grid size={{ xs: 12, [layoutQuery]: 3 }}>
            <Typography
              variant="body2"
              sx={(theme) => ({
                mx: 'auto',
                maxWidth: 280,
                [theme.breakpoints.up(layoutQuery)]: { mx: 'unset' },
              })}
            >
              {company.name} รับจัดงานด้วยความใส่ใจ เพื่อทุกช่วงเวลาสำคัญของคุณ
            </Typography>

            <Box
              sx={(theme) => ({
                mt: 3,
                mb: 5,
                display: 'flex',
                justifyContent: 'center',
                [theme.breakpoints.up(layoutQuery)]: { mb: 0, justifyContent: 'flex-start' },
              })}
            >
              {_socials.map((social) => (
                <IconButton key={social.label}>
                  {social.value === 'twitter' && <Iconify icon="socials:twitter" />}
                  {social.value === 'facebook' && <Iconify icon="socials:facebook" />}
                  {social.value === 'instagram' && <Iconify icon="socials:instagram" />}
                  {social.value === 'linkedin' && <Iconify icon="socials:linkedin" />}
                </IconButton>
              ))}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, [layoutQuery]: 6 }}>
            <Box
              sx={(theme) => ({
                gap: 5,
                display: 'flex',
                flexDirection: 'column',
                [theme.breakpoints.up(layoutQuery)]: { flexDirection: 'row' },
              })}
            >
              {links.map((list) => (
                <Box
                  key={list.headline}
                  sx={(theme) => ({
                    gap: 2,
                    width: 1,
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    [theme.breakpoints.up(layoutQuery)]: { alignItems: 'flex-start' },
                  })}
                >
                  <Typography component="div" variant="overline">
                    {list.headline}
                  </Typography>

                  {list.children.map((link) => (
                    <Link
                      key={link.name}
                      component={RouterLink}
                      href={link.href}
                      color="inherit"
                      variant="body2"
                    >
                      {link.name}
                    </Link>
                  ))}
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Typography variant="body2" sx={{ mt: 10 }}>
          © {new Date().getFullYear()} {company.name} สงวนลิขสิทธิ์
        </Typography>
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
      <Container>
        <CompanyLogo sx={{ width: 100, height: 100 }} />
        <Box sx={{ mt: 1, typography: 'caption', color: theme.palette.secondary.main }}>
          © {company.nameEn}
        </Box>
      </Container>
    </FooterRoot>
  );
}
