'use client';

import {
  RiAddLine,
  RiHome5Fill,
  RiListCheck2,
  RiSparklingFill,
  RiNotification3Fill,
} from '@remixicon/react';

import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ComponentBox, ComponentLayout } from '../../layout';

// ----------------------------------------------------------------------

const DEMO_COMPONENTS = [
  {
    name: 'Text',
    component: (
      <ComponentBox>
        <Breadcrumbs>
          <Link color="inherit" href="#">
            Material-UI
          </Link>
          <Link color="inherit" href="#">
            Core
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Breadcrumb</Typography>
        </Breadcrumbs>
      </ComponentBox>
    ),
  },
  {
    name: 'With icon',
    component: (
      <ComponentBox>
        <Breadcrumbs>
          <Link color="inherit" href="#" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <RiHome5Fill />
            Material-UI
          </Link>
          <Link color="inherit" href="#" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <RiSparklingFill />
            Core
          </Link>
          <Typography
            sx={{
              gap: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.primary',
            }}
          >
            <RiNotification3Fill />
            Breadcrumb
          </Typography>
        </Breadcrumbs>
      </ComponentBox>
    ),
  },
  {
    name: 'Customized',
    component: (
      <>
        <ComponentBox sx={{ mb: 3 }}>
          <CustomBreadcrumbs
            links={[
              {
                name: 'Home',
                href: '#',
                icon: <RiHome5Fill />,
              },
              { name: 'Link1', href: '#', icon: <RiListCheck2 /> },
              { name: 'Link2', href: '#', icon: <RiListCheck2 /> },
              { name: 'Link3', icon: <RiListCheck2 /> },
            ]}
          />
        </ComponentBox>

        <ComponentBox>
          <CustomBreadcrumbs
            heading="Heading"
            links={[
              {
                name: 'Home',
                href: '#',
                icon: <RiHome5Fill />,
              },
              { name: 'Link1', href: '#', icon: <RiListCheck2 /> },
              { name: 'Link2', href: '#', icon: <RiListCheck2 /> },
              { name: 'Link3', icon: <RiListCheck2 /> },
            ]}
            moreLinks={[
              'https://www.w3schools.com/cssref/pr_padding-right.php',
              'https://www.w3schools.com/cssref/css3_pr_overflow-x.php',
            ]}
            action={
              <Button variant="contained" startIcon={<RiAddLine />}>
                Add product
              </Button>
            }
            backHref="#"
            sx={{ width: 1, pl: 3 }}
          />
        </ComponentBox>
      </>
    ),
  },
];

// ----------------------------------------------------------------------

export function BreadcrumbsView() {
  return (
    <ComponentLayout
      sectionData={DEMO_COMPONENTS}
      heroProps={{
        heading: 'Breadcrumbs',
        moreLinks: ['https://mui.com/material-ui/react-breadcrumbs/'],
      }}
    />
  );
}
