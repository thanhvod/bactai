import React from 'react';
import { CircularProgress as MuiCircularProgress, CircularProgressProps as MuiCircularProgressProps } from '@mui/material';

export type CircularProgressProps = MuiCircularProgressProps;

export const CircularProgress = React.forwardRef<any, CircularProgressProps>((props, ref) => {
  return <MuiCircularProgress ref={ref} {...props} />;
});

CircularProgress.displayName = 'CircularProgress';

export default CircularProgress;
