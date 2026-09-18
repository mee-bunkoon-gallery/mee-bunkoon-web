import { RiArrowLeftSFill } from '@remixicon/react';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

// ----------------------------------------------------------------------

export type NavDrawerHeaderProps = React.ComponentProps<'div'> & {
  title: string;
  onBack: () => void;
};

export const NavDrawerHeader = styled(({ onBack, title, ...other }: NavDrawerHeaderProps) => (
  <div {...other}>
    <IconButton onClick={onBack}>
      <Box
        component={RiArrowLeftSFill}
        width={16}
        sx={(theme) => ({ ...(theme.direction === 'rtl' && { transform: 'scaleX(-1)' }) })}
      />
    </IconButton>
    {title}
  </div>
))(({ theme }) => ({
  ...theme.typography.subtitle1,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1.5, 1),
}));
