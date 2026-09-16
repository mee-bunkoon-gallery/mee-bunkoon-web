import type { Metadata } from 'next';

import { HomeView } from 'src/sections/home/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `MEE BUNKOON GALLERY`,
  description:
    'ฉลองขวัญ รำพัน รำพึง ความงดงามนั้น เป็นภวังค์ฝัน อันหนึ่ง บางคราวสาระนั้นก็ราวเลือนเร้นหาย จนคล้ายคลึง นิยายประโลมโลก',
};

export default function Page() {
  return <HomeView />;
}
