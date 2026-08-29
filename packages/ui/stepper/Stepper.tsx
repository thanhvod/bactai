import React from 'react';
import { Stepper as MuiStepper, StepperProps as MuiStepperProps } from '@mui/material';

export type StepperProps = MuiStepperProps;

export const Stepper = React.forwardRef<any, StepperProps>((props, ref) => {
  return <MuiStepper ref={ref} {...props} />;
});

Stepper.displayName = 'Stepper';

export default Stepper;
