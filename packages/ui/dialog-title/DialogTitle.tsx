import React from 'react';
import { DialogTitle as MuiDialogTitle, DialogTitleProps as MuiDialogTitleProps } from '@mui/material';

export type DialogTitleProps = MuiDialogTitleProps;

export const DialogTitle = React.forwardRef<any, DialogTitleProps>((props, ref) => {
  return <MuiDialogTitle ref={ref} {...props} />;
});

DialogTitle.displayName = 'DialogTitle';

export default DialogTitle;
