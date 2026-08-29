import React from 'react';
import { Divider as MuiDivider, DividerProps as MuiDividerProps } from '@mui/material';

export type DividerProps = MuiDividerProps;

export const Divider = React.forwardRef<any, DividerProps>((props, ref) => {
  return <MuiDivider ref={ref} {...props} />;
});

Divider.displayName = 'Divider';

export default Divider;
