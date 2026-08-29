import React from 'react';
import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';

export type TextFieldProps = MuiTextFieldProps;

export const TextField = React.forwardRef<any, TextFieldProps>((props, ref) => {
  return <MuiTextField ref={ref} {...props} />;
});

TextField.displayName = 'TextField';

export default TextField;
