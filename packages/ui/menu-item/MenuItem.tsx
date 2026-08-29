import React from 'react';
import { MenuItem as MuiMenuItem, MenuItemProps as MuiMenuItemProps } from '@mui/material';

export type MenuItemProps = MuiMenuItemProps & { component?: React.ElementType; to?: string; [key: string]: any };

export const MenuItem = React.forwardRef<any, MenuItemProps>((props, ref) => {
  return <MuiMenuItem ref={ref} {...props} />;
});

MenuItem.displayName = 'MenuItem';

export default MenuItem;
