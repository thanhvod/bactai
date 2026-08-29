import React from 'react';
import { Dialog as MuiDialog, DialogProps as MuiDialogProps } from '@mui/material';

export type DialogProps = MuiDialogProps;

export const Dialog = React.forwardRef<any, DialogProps>((props, ref) => {
  return <MuiDialog ref={ref} {...props} />;
});

Dialog.displayName = 'Dialog';

export default Dialog;
