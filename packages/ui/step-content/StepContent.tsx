import React from 'react';
import { StepContent as MuiStepContent, StepContentProps as MuiStepContentProps } from '@mui/material';

export type StepContentProps = MuiStepContentProps;

export const StepContent = React.forwardRef<any, StepContentProps>((props, ref) => {
  return <MuiStepContent ref={ref} {...props} />;
});

StepContent.displayName = 'StepContent';

export default StepContent;
