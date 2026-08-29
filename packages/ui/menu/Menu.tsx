import React from 'react';
import { Menu as MuiMenu, MenuProps as MuiMenuProps } from '@mui/material';

export type MenuProps = MuiMenuProps;

export const Menu = React.forwardRef<any, MenuProps>((props, ref) => {
  return <MuiMenu ref={ref} {...props} />;
});

Menu.displayName = 'Menu';

export default Menu;
