import React from 'react';
import { ListItemIcon as MuiListItemIcon, ListItemIconProps as MuiListItemIconProps } from '@mui/material';

export type ListItemIconProps = MuiListItemIconProps;

export const ListItemIcon = React.forwardRef<any, ListItemIconProps>((props, ref) => {
  return <MuiListItemIcon ref={ref} {...props} />;
});

ListItemIcon.displayName = 'ListItemIcon';

export default ListItemIcon;
