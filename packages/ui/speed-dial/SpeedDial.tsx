import React from 'react';
import { SpeedDial as MuiSpeedDial, SpeedDialProps as MuiSpeedDialProps } from '@mui/material';

export type SpeedDialProps = MuiSpeedDialProps;

export const SpeedDial = React.forwardRef<any, SpeedDialProps>((props, ref) => {
  return <MuiSpeedDial ref={ref} {...props} />;
});

SpeedDial.displayName = 'SpeedDial';

export default SpeedDial;
