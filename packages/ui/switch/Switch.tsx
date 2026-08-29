import React from 'react';
import { Switch as MuiSwitch, SwitchProps as MuiSwitchProps } from '@mui/material';

export type SwitchProps = MuiSwitchProps;

export const Switch = React.forwardRef<any, SwitchProps>((props, ref) => {
  return <MuiSwitch ref={ref} {...props} />;
});

Switch.displayName = 'Switch';

export default Switch;
