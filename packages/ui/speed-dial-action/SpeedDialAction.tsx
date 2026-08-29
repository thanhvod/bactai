import React from 'react';
import { SpeedDialAction as MuiSpeedDialAction, SpeedDialActionProps as MuiSpeedDialActionProps } from '@mui/material';

export type SpeedDialActionProps = MuiSpeedDialActionProps;

export const SpeedDialAction = React.forwardRef<any, SpeedDialActionProps>((props, ref) => {
  return <MuiSpeedDialAction ref={ref} {...props} />;
});

SpeedDialAction.displayName = 'SpeedDialAction';

export default SpeedDialAction;
