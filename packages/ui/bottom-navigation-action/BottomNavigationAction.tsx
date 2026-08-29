import React from 'react';
import { BottomNavigationAction as MuiBottomNavigationAction, BottomNavigationActionProps as MuiBottomNavigationActionProps } from '@mui/material';

export type BottomNavigationActionProps = MuiBottomNavigationActionProps;

export const BottomNavigationAction = React.forwardRef<any, BottomNavigationActionProps>((props, ref) => {
  return <MuiBottomNavigationAction ref={ref} {...props} />;
});

BottomNavigationAction.displayName = 'BottomNavigationAction';

export default BottomNavigationAction;
