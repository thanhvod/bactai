import React from 'react';
import { StepButton as MuiStepButton, StepButtonProps as MuiStepButtonProps } from '@mui/material';

export type StepButtonProps = MuiStepButtonProps;

export const StepButton = React.forwardRef<any, StepButtonProps>((props, ref) => {
  return <MuiStepButton ref={ref} {...props} />;
});

StepButton.displayName = 'StepButton';

export default StepButton;
