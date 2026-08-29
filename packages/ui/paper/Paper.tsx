import React from 'react';
import { Paper as MuiPaper, PaperProps as MuiPaperProps } from '@mui/material';

export type PaperProps = MuiPaperProps;

export const Paper = React.forwardRef<any, PaperProps>((props, ref) => {
  return <MuiPaper ref={ref} {...props} />;
});

Paper.displayName = 'Paper';

export default Paper;
