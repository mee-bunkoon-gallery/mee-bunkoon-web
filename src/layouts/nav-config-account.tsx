import type { AccountDrawerProps } from './components/account-drawer';

import {
  RiHome5Fill,
  RiUser3Fill,
  RiFileTextFill,
  RiSettings3Fill,
  RiShieldCheckFill,
} from '@remixicon/react';

// ----------------------------------------------------------------------

export const _account: AccountDrawerProps['data'] = [
  { label: 'Home', href: '/', icon: <RiHome5Fill /> },
  {
    label: 'Profile',
    href: '#',
    icon: <RiUser3Fill />,
  },
  {
    label: 'Projects',
    href: '#',
    icon: <RiFileTextFill />,
    info: '3',
  },
  {
    label: 'Subscription',
    href: '#',
    icon: <RiFileTextFill />,
  },
  { label: 'Security', href: '#', icon: <RiShieldCheckFill /> },
  { label: 'Account settings', href: '#', icon: <RiSettings3Fill /> },
];
