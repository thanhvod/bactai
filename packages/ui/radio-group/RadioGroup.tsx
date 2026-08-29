import React from 'react';
import { RadioGroup as MuiRadioGroup, RadioGroupProps as MuiRadioGroupProps } from '@mui/material';

export type RadioGroupProps = MuiRadioGroupProps;

export const RadioGroup = React.forwardRef<any, RadioGroupProps>((props, ref) => {
  return <MuiRadioGroup ref={ref} {...props} />;
});

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
