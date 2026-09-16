'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import { SignOutButton } from 'src/layouts/components/sign-out-button';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function OverviewView() {
  const { user } = useAuthContext();

  const displayName = user?.displayName || user?.email;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">Welcome back{displayName ? `, ${displayName}` : ''}</Typography>

      <Card sx={{ mt: 5, p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
        <Avatar sx={{ width: 64, height: 64 }}>{displayName?.charAt(0).toUpperCase()}</Avatar>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap>
            {displayName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user?.email}
          </Typography>
          {user?.created_at && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Member since {fDate(user.created_at)}
            </Typography>
          )}
        </Box>

        <SignOutButton sx={{ width: 'auto', px: 2, flexShrink: 0 }} />
      </Card>
    </DashboardContent>
  );
}
