import React from 'react';
import { StepIcon as MuiStepIcon, StepIconProps as MuiStepIconProps } from '@mui/material';

export type StepIconProps = MuiStepIconProps;

export const StepIcon = React.forwardRef<any, StepIconProps>((props, ref) => {
  return <MuiStepIcon ref={ref} {...props} />;
});

StepIcon.displayName = 'StepIcon';

export default StepIcon;
