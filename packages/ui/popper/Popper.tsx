import React from 'react';
import { Popper as MuiPopper, PopperProps as MuiPopperProps } from '@mui/material';

export type PopperProps = MuiPopperProps;

export const Popper = React.forwardRef<any, PopperProps>((props, ref) => {
  return <MuiPopper ref={ref} {...props} />;
});

Popper.displayName = 'Popper';

export default Popper;
