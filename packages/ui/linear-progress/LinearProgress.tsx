import React from 'react';
import { LinearProgress as MuiLinearProgress, LinearProgressProps as MuiLinearProgressProps } from '@mui/material';

export type LinearProgressProps = MuiLinearProgressProps;

export const LinearProgress = React.forwardRef<any, LinearProgressProps>((props, ref) => {
  return <MuiLinearProgress ref={ref} {...props} />;
});

LinearProgress.displayName = 'LinearProgress';

export default LinearProgress;
