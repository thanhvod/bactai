import React from 'react';
import { AppBar as MuiAppBar, AppBarProps as MuiAppBarProps } from '@mui/material';

export type AppBarProps = MuiAppBarProps;

export const AppBar = React.forwardRef<any, AppBarProps>((props, ref) => {
  return <MuiAppBar ref={ref} {...props} />;
});

AppBar.displayName = 'AppBar';

export default AppBar;
