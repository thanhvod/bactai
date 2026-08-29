import React from 'react';
import { DialogContent as MuiDialogContent, DialogContentProps as MuiDialogContentProps } from '@mui/material';

export type DialogContentProps = MuiDialogContentProps;

export const DialogContent = React.forwardRef<any, DialogContentProps>((props, ref) => {
  return <MuiDialogContent ref={ref} {...props} />;
});

DialogContent.displayName = 'DialogContent';

export default DialogContent;
