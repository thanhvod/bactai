import React from 'react';
import { Alert as MuiAlert, AlertProps as MuiAlertProps } from '@mui/material';

export type AlertProps = MuiAlertProps;

export const Alert = React.forwardRef<any, AlertProps>((props, ref) => {
  return <MuiAlert ref={ref} {...props} />;
});

Alert.displayName = 'Alert';

export default Alert;
