import React from 'react';
import { InputAdornment as MuiInputAdornment, InputAdornmentProps as MuiInputAdornmentProps } from '@mui/material';

export type InputAdornmentProps = MuiInputAdornmentProps;

export const InputAdornment = React.forwardRef<any, InputAdornmentProps>((props, ref) => {
  return <MuiInputAdornment ref={ref} {...props} />;
});

InputAdornment.displayName = 'InputAdornment';

export default InputAdornment;
