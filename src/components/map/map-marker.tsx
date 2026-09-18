'use client';

import type { MarkerProps } from 'react-map-gl/maplibre';
import type { Theme, SxProps } from '@mui/material/styles';

import { Marker } from 'react-map-gl/maplibre';
import { RiMapPin2Fill } from '@remixicon/react';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export type MapMarkerProps = MarkerProps & {
  sx?: SxProps<Theme>;
};

export function MapMarker({ sx, ...other }: MapMarkerProps) {
  return (
    <Marker {...other}>
      <Box
        component={RiMapPin2Fill}
        width={26}
        sx={[{ color: 'error.main' }, ...(Array.isArray(sx) ? sx : [sx])]}
      />
    </Marker>
  );
}
