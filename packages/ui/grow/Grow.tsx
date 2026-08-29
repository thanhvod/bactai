import React from 'react';
import { Grow as MuiGrow, GrowProps as MuiGrowProps } from '@mui/material';

export type GrowProps = MuiGrowProps;

export const Grow = React.forwardRef<any, GrowProps>((props, ref) => {
  return <MuiGrow ref={ref} {...props} />;
});

Grow.displayName = 'Grow';

export default Grow;
