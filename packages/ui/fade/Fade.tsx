import React from 'react';
import { Fade as MuiFade, FadeProps as MuiFadeProps } from '@mui/material';

export type FadeProps = MuiFadeProps;

export const Fade = React.forwardRef<any, FadeProps>((props, ref) => {
  return <MuiFade ref={ref} {...props} />;
});

Fade.displayName = 'Fade';

export default Fade;
