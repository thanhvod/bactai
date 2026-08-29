import React from 'react';
import { CssBaseline as MuiCssBaseline, CssBaselineProps as MuiCssBaselineProps } from '@mui/material';

export type CssBaselineProps = MuiCssBaselineProps;

export const CssBaseline = (props: CssBaselineProps) => {
  return <MuiCssBaseline {...props} />;
};

CssBaseline.displayName = 'CssBaseline';

export default CssBaseline;
