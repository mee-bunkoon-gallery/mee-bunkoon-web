import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { EventTypeListView } from 'src/sections/event-type/event-type-list-view';

export const metadata: Metadata = { title: `ประเภทงาน - ${CONFIG.appName}` };

export default function Page() {
  return <EventTypeListView />;
}
