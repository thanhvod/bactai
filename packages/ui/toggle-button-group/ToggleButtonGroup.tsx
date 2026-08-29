import React from 'react';
import { ToggleButtonGroup as MuiToggleButtonGroup, ToggleButtonGroupProps as MuiToggleButtonGroupProps } from '@mui/material';

export type ToggleButtonGroupProps = MuiToggleButtonGroupProps;

export const ToggleButtonGroup = React.forwardRef<any, ToggleButtonGroupProps>((props, ref) => {
  return <MuiToggleButtonGroup ref={ref} {...props} />;
});

ToggleButtonGroup.displayName = 'ToggleButtonGroup';

export default ToggleButtonGroup;
