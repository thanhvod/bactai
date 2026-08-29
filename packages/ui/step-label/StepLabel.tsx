import React from 'react';
import { StepLabel as MuiStepLabel, StepLabelProps as MuiStepLabelProps } from '@mui/material';

export type StepLabelProps = MuiStepLabelProps;

export const StepLabel = React.forwardRef<any, StepLabelProps>((props, ref) => {
  return <MuiStepLabel ref={ref} {...props} />;
});

StepLabel.displayName = 'StepLabel';

export default StepLabel;
