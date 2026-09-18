import allIcons from './icon-sets';

// ----------------------------------------------------------------------

type IconSet = {
  prefix: string;
  icons: Record<string, (typeof allIcons)[keyof typeof allIcons]>;
};

export const iconSets = Object.entries(allIcons).reduce((acc, [key, value]) => {
  const [prefix, iconName] = key.split(':');
  const existingPrefix = acc.find((item) => item.prefix === prefix);

  if (existingPrefix) {
    existingPrefix.icons[iconName] = value;
  } else {
    acc.push({
      prefix,
      icons: {
        [iconName]: value,
      },
    });
  }

  return acc;
}, [] as IconSet[]);

export const allIconNames = Object.keys(allIcons) as IconifyName[];

export type IconifyName = keyof typeof allIcons;

// Kept as a compatibility no-op for modules that imported the old Iconify setup.
export function registerIcons() {}
