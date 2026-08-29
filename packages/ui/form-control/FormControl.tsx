import React from 'react';
import { FormControl as MuiFormControl, FormControlProps as MuiFormControlProps } from '@mui/material';

export type FormControlProps = MuiFormControlProps;

export const FormControl = React.forwardRef<any, FormControlProps>((props, ref) => {
  return <MuiFormControl ref={ref} {...props} />;
});

FormControl.displayName = 'FormControl';

export default FormControl;
