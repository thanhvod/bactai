import React from 'react';
import { SpeedDialIcon as MuiSpeedDialIcon, SpeedDialIconProps as MuiSpeedDialIconProps } from '@mui/material';

export type SpeedDialIconProps = MuiSpeedDialIconProps;

export const SpeedDialIcon = React.forwardRef<any, SpeedDialIconProps>((props, ref) => {
  return <MuiSpeedDialIcon ref={ref} {...props} />;
});

SpeedDialIcon.displayName = 'SpeedDialIcon';

export default SpeedDialIcon;
