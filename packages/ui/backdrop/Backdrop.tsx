import React from 'react';
import { Backdrop as MuiBackdrop, BackdropProps as MuiBackdropProps } from '@mui/material';

export type BackdropProps = MuiBackdropProps;

export const Backdrop = React.forwardRef<any, BackdropProps>((props, ref) => {
  return <MuiBackdrop ref={ref} {...props} />;
});

Backdrop.displayName = 'Backdrop';

export default Backdrop;
