import { MainLayout } from 'src/layouts/main';

import { GuestGuard } from 'src/auth/guard';

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <GuestGuard>
      <MainLayout>{children}</MainLayout>
    </GuestGuard>
  );
}
