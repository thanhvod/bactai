import React from 'react';
import { Fab as MuiFab, FabProps as MuiFabProps } from '@mui/material';

export type FabProps = MuiFabProps;

export const Fab = React.forwardRef<any, FabProps>((props, ref) => {
  return <MuiFab ref={ref} {...props} />;
});

Fab.displayName = 'Fab';

export default Fab;
