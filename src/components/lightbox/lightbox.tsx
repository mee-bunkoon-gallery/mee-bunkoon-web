'use client';

import type { LightboxProps } from './types';

import { mergeClasses } from 'minimal-shared/utils';
import ReactLightbox, { useLightboxState } from 'yet-another-react-lightbox';
import {
  RiCloseLine,
  RiPauseFill,
  RiZoomInFill,
  RiZoomOutFill,
  RiArrowLeftSFill,
  RiFullscreenFill,
  RiPlayCircleFill,
  RiArrowRightSFill,
  RiFullscreenExitFill,
} from '@remixicon/react';

import Box from '@mui/material/Box';

import { getPlugins } from './utils';
import { lightboxClasses } from './classes';

// ----------------------------------------------------------------------

export function Lightbox({
  slides,
  disableZoom,
  disableVideo,
  disableTotal,
  disableCaptions,
  disableSlideshow,
  disableThumbnails,
  disableFullscreen,
  onGetCurrentIndex,
  className,
  ...other
}: LightboxProps) {
  const totalItems = slides ? slides.length : 0;

  return (
    <ReactLightbox
      slides={slides}
      animation={{ swipe: 240 }}
      carousel={{ finite: totalItems < 5 }}
      controller={{ closeOnBackdropClick: true }}
      plugins={getPlugins({
        disableZoom,
        disableVideo,
        disableCaptions,
        disableSlideshow,
        disableThumbnails,
        disableFullscreen,
      })}
      on={{
        view: ({ index }: { index: number }) => {
          if (onGetCurrentIndex) {
            onGetCurrentIndex(index);
          }
        },
      }}
      toolbar={{
        buttons: [
          <DisplayTotal key={0} totalItems={totalItems} disableTotal={disableTotal} />,
          'close',
        ],
      }}
      render={{
        iconClose: () => <RiCloseLine size={24} />,
        iconZoomIn: () => <RiZoomInFill size={24} />,
        iconZoomOut: () => <RiZoomOutFill size={24} />,
        iconSlideshowPlay: () => <RiPlayCircleFill size={24} />,
        iconSlideshowPause: () => <RiPauseFill size={24} />,
        iconPrev: () => <RiArrowLeftSFill size={32} />,
        iconNext: () => <RiArrowRightSFill size={32} />,
        iconExitFullscreen: () => <RiFullscreenExitFill size={24} />,
        iconEnterFullscreen: () => <RiFullscreenFill size={24} />,
      }}
      className={mergeClasses([lightboxClasses.root, className])}
      {...other}
    />
  );
}

// ----------------------------------------------------------------------

type DisplayTotalProps = {
  totalItems: number;
  disableTotal?: boolean;
};

function DisplayTotal({ totalItems, disableTotal }: DisplayTotalProps) {
  const { currentIndex } = useLightboxState();

  if (disableTotal) {
    return null;
  }

  return (
    <Box
      component="span"
      className="yarl__button"
      sx={{
        typography: 'body2',
        alignItems: 'center',
        display: 'inline-flex',
        justifyContent: 'center',
      }}
    >
      <strong> {currentIndex + 1} </strong> / {totalItems}
    </Box>
  );
}
