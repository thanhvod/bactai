import React from 'react';
import { Step as MuiStep, StepProps as MuiStepProps } from '@mui/material';

export type StepProps = MuiStepProps;

export const Step = React.forwardRef<any, StepProps>((props, ref) => {
  return <MuiStep ref={ref} {...props} />;
});

Step.displayName = 'Step';

export default Step;
