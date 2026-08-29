import React from 'react';
import { SnackbarContent as MuiSnackbarContent, SnackbarContentProps as MuiSnackbarContentProps } from '@mui/material';

export type SnackbarContentProps = MuiSnackbarContentProps;

export const SnackbarContent = React.forwardRef<any, SnackbarContentProps>((props, ref) => {
  return <MuiSnackbarContent ref={ref} {...props} />;
});

SnackbarContent.displayName = 'SnackbarContent';

export default SnackbarContent;
