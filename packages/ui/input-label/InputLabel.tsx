import React from 'react';
import { InputLabel as MuiInputLabel, InputLabelProps as MuiInputLabelProps } from '@mui/material';

export type InputLabelProps = MuiInputLabelProps;

export const InputLabel = React.forwardRef<any, InputLabelProps>((props, ref) => {
  return <MuiInputLabel ref={ref} {...props} />;
});

InputLabel.displayName = 'InputLabel';

export default InputLabel;
