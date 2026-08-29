import React from 'react';
import { Select as MuiSelect, SelectProps as MuiSelectProps } from '@mui/material';

export type SelectProps = MuiSelectProps;

export const Select = React.forwardRef<any, SelectProps>((props, ref) => {
  return <MuiSelect ref={ref} {...props} />;
});

Select.displayName = 'Select';

export default Select;
