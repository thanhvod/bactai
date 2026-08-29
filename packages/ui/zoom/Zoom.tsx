import React from 'react';
import { Zoom as MuiZoom, ZoomProps as MuiZoomProps } from '@mui/material';

export type ZoomProps = MuiZoomProps;

export const Zoom = React.forwardRef<any, ZoomProps>((props, ref) => {
  return <MuiZoom ref={ref} {...props} />;
});

Zoom.displayName = 'Zoom';

export default Zoom;
