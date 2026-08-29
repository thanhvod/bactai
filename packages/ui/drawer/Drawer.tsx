import React from 'react';
import { Drawer as MuiDrawer, DrawerProps as MuiDrawerProps } from '@mui/material';

export type DrawerProps = MuiDrawerProps;

export const Drawer = React.forwardRef<any, DrawerProps>((props, ref) => {
  return <MuiDrawer ref={ref} {...props} />;
});

Drawer.displayName = 'Drawer';

export default Drawer;
