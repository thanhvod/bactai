import React from 'react';
import { ToggleButton as MuiToggleButton, ToggleButtonProps as MuiToggleButtonProps } from '@mui/material';

export type ToggleButtonProps = MuiToggleButtonProps;

export const ToggleButton = React.forwardRef<any, ToggleButtonProps>((props, ref) => {
  return <MuiToggleButton ref={ref} {...props} />;
});

ToggleButton.displayName = 'ToggleButton';

export default ToggleButton;
