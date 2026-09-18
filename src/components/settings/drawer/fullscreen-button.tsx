'use client';

import { useState, useCallback } from 'react';
import { RiFullscreenFill, RiFullscreenExitFill } from '@remixicon/react';

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

// ----------------------------------------------------------------------

export function FullScreenButton() {
  const [fullscreen, setFullscreen] = useState(false);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  return (
    <Tooltip title={fullscreen ? 'Exit' : 'Fullscreen'}>
      <IconButton onClick={handleToggleFullscreen} color={fullscreen ? 'primary' : 'default'}>
        {fullscreen ? <RiFullscreenExitFill /> : <RiFullscreenFill />}
      </IconButton>
    </Tooltip>
  );
}
