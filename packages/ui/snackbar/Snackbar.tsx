import React from 'react';
import { Snackbar as MuiSnackbar, SnackbarProps as MuiSnackbarProps } from '@mui/material';

export type SnackbarProps = MuiSnackbarProps;

export const Snackbar = React.forwardRef<any, SnackbarProps>((props, ref) => {
  return <MuiSnackbar ref={ref} {...props} />;
});

Snackbar.displayName = 'Snackbar';

export default Snackbar;
