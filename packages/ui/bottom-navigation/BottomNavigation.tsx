import React from 'react';
import { BottomNavigation as MuiBottomNavigation, BottomNavigationProps as MuiBottomNavigationProps } from '@mui/material';

export type BottomNavigationProps = MuiBottomNavigationProps;

export const BottomNavigation = React.forwardRef<any, BottomNavigationProps>((props, ref) => {
  return <MuiBottomNavigation ref={ref} {...props} />;
});

BottomNavigation.displayName = 'BottomNavigation';

export default BottomNavigation;
