import React from 'react';
import { DialogActions as MuiDialogActions, DialogActionsProps as MuiDialogActionsProps } from '@mui/material';

export type DialogActionsProps = MuiDialogActionsProps;

export const DialogActions = React.forwardRef<any, DialogActionsProps>((props, ref) => {
  return <MuiDialogActions ref={ref} {...props} />;
});

DialogActions.displayName = 'DialogActions';

export default DialogActions;
