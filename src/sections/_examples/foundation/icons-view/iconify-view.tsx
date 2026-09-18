'use client';

import type { BoxProps } from '@mui/material/Box';
import type { RemixiconComponentType } from '@remixicon/react';

import { useState, useCallback } from 'react';
import * as RemixIcons from '@remixicon/react';
import { useCopyToClipboard } from 'minimal-shared/hooks';
import { RiCloseLine, RiSearchFill } from '@remixicon/react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export function IconifyView() {
  const { copy } = useCopyToClipboard();

  const [searchQuery, setSearchQuery] = useState('');
  const icons = Object.entries(RemixIcons).filter(
    ([name, component]) => name.startsWith('Ri') && typeof component === 'function'
  ) as [string, RemixiconComponentType][];

  const handleCopy = useCallback(
    (iconMarkup: string) => {
      if (iconMarkup) {
        toast.success('Copied!', { description: iconMarkup });
        copy(iconMarkup);
      }
    },
    [copy]
  );

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const renderHeader = () => (
    <Box sx={{ flex: '1 1 auto' }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        RemixIcon
      </Typography>

      <CustomBreadcrumbs
        links={[
          { name: 'Home', href: '/' },
          { name: 'Components', href: '/components' },
          { name: 'Icons', href: '/components/foundation/icons' },
          { name: 'RemixIcon' },
        ]}
      />

      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        RemixIcon icons used in this template.
      </Typography>
    </Box>
  );

  const renderSearch = () => (
    <TextField
      fullWidth
      placeholder="Search..."
      value={searchQuery}
      onChange={handleSearch}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Box component={RiSearchFill} sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
          endAdornment: !!searchQuery && (
            <InputAdornment position="end">
              <IconButton edge="end" size="small" onClick={handleClearSearch}>
                <RiCloseLine />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      sx={{ maxWidth: 280 }}
    />
  );

  return (
    <Container sx={{ pt: 3, pb: 10 }}>
      <Box
        sx={{
          mb: 5,
          gap: 3,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        {renderHeader()}
        {renderSearch()}
      </Box>

      <Grid container spacing={1}>
        {icons
          .filter(([name]) => name.toLowerCase().includes(searchQuery))
          .map(([name, Icon]) => (
            <Grid key={name} size="auto">
              <IconBox iconName={name} icon={Icon} onClick={() => handleCopy(name)} />
            </Grid>
          ))}
      </Grid>
    </Container>
  );
}

// ----------------------------------------------------------------------

type IconBoxProps = BoxProps & {
  iconName: string;
  icon: RemixiconComponentType;
};

function IconBox({ iconName, icon, sx, ...other }: IconBoxProps) {
  return (
    <Tooltip title={iconName}>
      <Box
        sx={[
          (theme) => ({
            width: 48,
            height: 48,
            borderRadius: 1,
            display: 'flex',
            cursor: 'pointer',
            alignItems: 'center',
            color: 'text.secondary',
            justifyContent: 'center',
            bgcolor: 'background.default',
            '&:hover': {
              color: 'text.primary',
              boxShadow: theme.vars.customShadows.z8,
            },
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <Box component={icon} sx={{ width: 24, height: 24 }} />
      </Box>
    </Tooltip>
  );
}
