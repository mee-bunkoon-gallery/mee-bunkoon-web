import type { NodeProps } from './data';

import { usePopover } from 'minimal-shared/hooks';
import { RiEditLine, RiMoreFill, RiDeleteBin6Fill } from '@remixicon/react';

import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { toast } from 'src/components/snackbar';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export function StandardNode({ name, avatarUrl, role, sx }: NodeProps) {
  const menuActions = usePopover();

  const onDelete = () => {
    menuActions.onClose();
    toast.warning(`onDelete: ${name}`);
  };

  const onEdit = () => {
    menuActions.onClose();
    toast.info(`onEdit: ${name}`);
  };

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'left-center' } }}
    >
      <MenuList>
        <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
          <RiDeleteBin6Fill />
          Delete
        </MenuItem>

        <MenuItem onClick={onEdit}>
          <RiEditLine />
          Edit
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <Card
        sx={[
          () => ({
            p: 2,
            minWidth: 200,
            borderRadius: 1.5,
            textAlign: 'left',
            position: 'relative',
            display: 'inline-flex',
            flexDirection: 'column',
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <IconButton
          color={menuActions.open ? 'inherit' : 'default'}
          onClick={menuActions.onOpen}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <RiMoreFill />
        </IconButton>

        <Avatar
          alt={name}
          src={avatarUrl}
          sx={{
            mr: 2,
            mb: 2,
            width: 48,
            height: 48,
          }}
        />

        <Typography variant="subtitle2" noWrap sx={{ mb: 0.5 }}>
          {name}
        </Typography>

        <Typography variant="caption" component="div" noWrap sx={{ color: 'text.secondary' }}>
          {role}
        </Typography>
      </Card>

      {renderMenuActions()}
    </>
  );
}
