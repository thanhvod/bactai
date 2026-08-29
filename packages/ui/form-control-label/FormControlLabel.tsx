import React from 'react';
import { FormControlLabel as MuiFormControlLabel, FormControlLabelProps as MuiFormControlLabelProps } from '@mui/material';

export type FormControlLabelProps = MuiFormControlLabelProps;

export const FormControlLabel = React.forwardRef<any, FormControlLabelProps>((props, ref) => {
  return <MuiFormControlLabel ref={ref} {...props} />;
});

FormControlLabel.displayName = 'FormControlLabel';

export default FormControlLabel;
