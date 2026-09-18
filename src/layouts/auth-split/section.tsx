import type { BoxProps } from '@mui/material/Box';
import type { Breakpoint } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';

import { Logo } from 'src/components/logo';

// ----------------------------------------------------------------------

export type AuthSplitSectionProps = BoxProps & {
  title?: string;
  method?: string;
  imgUrl?: string;
  subtitle?: string;
  layoutQuery?: Breakpoint;
  methods?: {
    path: string;
    icon: string;
    label: string;
  }[];
};

export function AuthSplitSection({
  sx,
  method,
  methods,
  layoutQuery = 'md',
  title = 'Manage the job',
  imgUrl = `${CONFIG.assetsDir}/assets/illustrations/illustration-dashboard.webp`,
  subtitle = 'MEE BUNKOON GALLERY',
  ...other
}: AuthSplitSectionProps) {
  return (
    <Box
      sx={[
        (theme) => ({
          ...theme.mixins.bgGradient({
            images: [
              'linear-gradient(135deg, rgba(5,37,24,0.96), rgba(9,65,44,0.74))',
              `url(${CONFIG.assetsDir}/assets/background/hero-2.jpg)`,
            ],
          }),
          px: 3,
          pb: 3,
          width: 1,
          maxWidth: 'clamp(480px, 40vw, 680px)',
          display: 'none',
          position: 'relative',
          pt: 3,
          [theme.breakpoints.up(layoutQuery)]: {
            gap: 5,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ maxWidth: 440, color: 'common.white', textAlign: 'center' }}>
        <Box
          sx={{
            width: 124,
            height: 124,
            mx: 'auto',
            mb: 4.5,
            p: 1.75,
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            bgcolor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: '0 20px 48px rgba(0,0,0,0.2)',
          }}
        >
          <Logo sx={{ width: 1, height: 1 }} />
        </Box>
        <Typography variant="h2" sx={{ fontSize: { md: 36, lg: 42 }, textAlign: 'center' }}>
          {title}
        </Typography>

        {subtitle && (
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.72)',
              textAlign: 'center',
              mt: 2,
              fontSize: 16,
              lineHeight: 1.8,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* <Box
        component="img"
        alt="Dashboard illustration"
        src={imgUrl}
        sx={{ width: 1, aspectRatio: '4/3', objectFit: 'cover' }}
      /> */}

      {/* {!!methods?.length && method && (
        <Box component="ul" sx={{ gap: 2, display: 'flex' }}>
          {methods.map((option) => {
            const selected = method === option.label.toLowerCase();

            return (
              <Box
                key={option.label}
                component="li"
                sx={{
                  ...(!selected && {
                    cursor: 'not-allowed',
                    filter: 'grayscale(1)',
                  }),
                }}
              >
                <Tooltip title={option.label} placement="top">
                  <Link
                    component={RouterLink}
                    href={option.path}
                    sx={{ ...(!selected && { pointerEvents: 'none' }) }}
                  >
                    <Box
                      component="img"
                      alt={option.label}
                      src={option.icon}
                      sx={{ width: 32, height: 32 }}
                    />
                  </Link>
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      )} */}
    </Box>
  );
}
