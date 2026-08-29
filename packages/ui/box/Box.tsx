import React from 'react';
import { Box as MuiBox, BoxProps as MuiBoxProps } from '@mui/material';

export type BoxProps = MuiBoxProps & { component?: React.ElementType; [key: string]: any };

export const Box = React.forwardRef<any, BoxProps>((props, ref) => {
  return <MuiBox ref={ref} {...props} />;
});

Box.displayName = 'Box';

export default Box;
