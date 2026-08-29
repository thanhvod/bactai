import React from 'react';
import { Checkbox as MuiCheckbox, CheckboxProps as MuiCheckboxProps } from '@mui/material';

export type CheckboxProps = MuiCheckboxProps;

export const Checkbox = React.forwardRef<any, CheckboxProps>((props, ref) => {
  return <MuiCheckbox ref={ref} {...props} />;
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
