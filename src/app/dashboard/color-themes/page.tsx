import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ColorThemeListView } from 'src/sections/color-theme/color-theme-list-view';

export const metadata: Metadata = { title: `โทนสี - ${CONFIG.appName}` };

export default function Page() {
  return <ColorThemeListView />;
}
