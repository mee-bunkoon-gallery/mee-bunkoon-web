'use client';

import { useState, useCallback } from 'react';
import {
  RiMailFill,
  RiStarLine,
  RiWifiFill,
  RiImageFill,
  RiArchiveFill,
  RiArrowUpSFill,
  RiSuitcaseFill,
  RiBluetoothFill,
  RiArrowDownSFill,
  RiSendPlane2Fill,
  RiInformationFill,
} from '@remixicon/react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Avatar from '@mui/material/Avatar';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Collapse from '@mui/material/Collapse';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import { ComponentBox, ComponentLayout } from '../../layout';

// ----------------------------------------------------------------------

export function ListView() {
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState([0]);
  const [toggle, setToggle] = useState(['wifi']);
  const [selectedIndex, setSelectedIndex] = useState(1);

  const handleClick = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleListItemClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
      setSelectedIndex(index);
    },
    []
  );

  const handleCheck = useCallback(
    (value: number) => () => {
      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];
      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
      setChecked(newChecked);
    },
    [checked]
  );

  const handleToggle = useCallback(
    (value: string) => () => {
      const currentIndex = toggle.indexOf(value);
      const newChecked = [...toggle];

      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }

      setToggle(newChecked);
    },
    [toggle]
  );

  const DEMO_COMPONENTS = [
    {
      name: 'Simple',
      component: (
        <ComponentBox>
          <Box sx={{ width: 1, bgcolor: 'background.paper' }}>
            <nav aria-label="main mailbox folders">
              <List>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <RiArchiveFill size={24} />
                    </ListItemIcon>
                    <ListItemText primary="Inbox" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <RiMailFill size={24} />
                    </ListItemIcon>
                    <ListItemText primary="Drafts" />
                  </ListItemButton>
                </ListItem>
              </List>
            </nav>

            <Divider />
            <nav aria-label="secondary mailbox folders">
              <List>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary="Trash" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component="a" href="#simple-list">
                    <ListItemText primary="Spam" />
                  </ListItemButton>
                </ListItem>
              </List>
            </nav>
          </Box>
        </ComponentBox>
      ),
    },
    {
      name: 'Nested',
      component: (
        <ComponentBox>
          <List
            sx={{ width: 1, bgcolor: 'background.paper' }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
              <ListSubheader component="div" id="nested-list-subheader">
                Nested List Items
              </ListSubheader>
            }
          >
            <ListItemButton>
              <ListItemIcon>
                <RiSendPlane2Fill size={24} />
              </ListItemIcon>
              <ListItemText primary="Sent mail" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <RiMailFill size={24} />
              </ListItemIcon>
              <ListItemText primary="Drafts" />
            </ListItemButton>
            <ListItemButton onClick={handleClick}>
              <ListItemIcon>
                <RiArchiveFill size={24} />
              </ListItemIcon>
              <ListItemText primary="Inbox" />
              {open ? <RiArrowUpSFill /> : <RiArrowDownSFill />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <RiStarLine size={24} />
                  </ListItemIcon>
                  <ListItemText primary="Starred" />
                </ListItemButton>
              </List>
            </Collapse>
          </List>
        </ComponentBox>
      ),
    },
    {
      name: 'Folder',
      component: (
        <ComponentBox>
          <List sx={{ width: 1, bgcolor: 'background.paper' }}>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <RiImageFill size={24} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Photos" secondary="Jan 9, 2014" />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <RiSuitcaseFill size={24} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Work" secondary="Jan 7, 2014" />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <RiInformationFill size={24} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Vacation" secondary="July 20, 2014" />
            </ListItem>
          </List>
        </ComponentBox>
      ),
    },
    {
      name: 'Selected',
      component: (
        <ComponentBox>
          <Box sx={{ width: 1, bgcolor: 'background.paper' }}>
            <List component="nav" aria-label="main mailbox folders">
              <ListItemButton
                selected={selectedIndex === 0}
                onClick={(event) => handleListItemClick(event, 0)}
              >
                <ListItemIcon>
                  <RiArchiveFill size={24} />
                </ListItemIcon>
                <ListItemText primary="Inbox" />
              </ListItemButton>
              <ListItemButton
                selected={selectedIndex === 1}
                onClick={(event) => handleListItemClick(event, 1)}
              >
                <ListItemIcon>
                  <RiMailFill size={24} />
                </ListItemIcon>
                <ListItemText primary="Drafts" />
              </ListItemButton>
            </List>
            <Divider />
            <List component="nav" aria-label="secondary mailbox folder">
              <ListItemButton
                selected={selectedIndex === 2}
                onClick={(event) => handleListItemClick(event, 2)}
              >
                <ListItemText primary="Trash" />
              </ListItemButton>
              <ListItemButton
                selected={selectedIndex === 3}
                onClick={(event) => handleListItemClick(event, 3)}
              >
                <ListItemText primary="Spam" />
              </ListItemButton>
            </List>
          </Box>
        </ComponentBox>
      ),
    },
    {
      name: 'Controls',
      component: (
        <ComponentBox>
          <List sx={{ width: 1, bgcolor: 'background.paper' }}>
            {[0, 1, 2, 3].map((value) => (
              <ListItem
                key={value}
                secondaryAction={
                  <IconButton edge="end" aria-label="comments">
                    <RiInformationFill size={24} />
                  </IconButton>
                }
                disablePadding
              >
                <ListItemButton key={value} role={undefined} dense onClick={handleCheck(value)}>
                  <Checkbox
                    edge="start"
                    checked={checked.indexOf(value) !== -1}
                    tabIndex={-1}
                    disableRipple
                    slotProps={{
                      input: {
                        id: `${value}-checkbox`,
                        'aria-label': `${value} checkbox`,
                      },
                    }}
                  />

                  <ListItemText primary={`Line item ${value + 1}`} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </ComponentBox>
      ),
    },
    {
      name: 'Switch',
      component: (
        <ComponentBox>
          <List
            subheader={<ListSubheader>Settings</ListSubheader>}
            sx={{ width: 1, bgcolor: 'background.paper' }}
          >
            <ListItem
              disablePadding
              secondaryAction={
                <Switch
                  edge="end"
                  onChange={handleToggle('wifi')}
                  checked={toggle.indexOf('wifi') !== -1}
                  slotProps={{
                    input: {
                      id: 'wifi-switch',
                      'aria-label': 'Wifi switch',
                    },
                  }}
                />
              }
            >
              <ListItemButton>
                <ListItemIcon>
                  <RiWifiFill size={24} />
                </ListItemIcon>
                <ListItemText id="switch-list-label-wifi" primary="Wi-Fi" />
              </ListItemButton>
            </ListItem>

            <ListItem
              disablePadding
              secondaryAction={
                <Switch
                  edge="end"
                  onChange={handleToggle('bluetooth')}
                  checked={toggle.indexOf('bluetooth') !== -1}
                  slotProps={{
                    input: {
                      id: 'bluetooth-switch',
                      'aria-label': 'Bluetooth switch',
                    },
                  }}
                />
              }
            >
              <ListItemButton>
                <ListItemIcon>
                  <RiBluetoothFill size={24} />
                </ListItemIcon>
                <ListItemText id="switch-list-label-bluetooth" primary="Bluetooth" />
              </ListItemButton>
            </ListItem>
          </List>
        </ComponentBox>
      ),
    },
  ];

  return (
    <ComponentLayout
      sectionData={DEMO_COMPONENTS}
      heroProps={{
        heading: 'List',
        moreLinks: ['https://mui.com/material-ui/react-list/'],
      }}
    />
  );
}
