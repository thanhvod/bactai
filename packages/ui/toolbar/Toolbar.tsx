import React from 'react';
import { Toolbar as MuiToolbar, ToolbarProps as MuiToolbarProps } from '@mui/material';

export type ToolbarProps = MuiToolbarProps;

export const Toolbar = React.forwardRef<any, ToolbarProps>((props, ref) => {
  return <MuiToolbar ref={ref} {...props} />;
});

Toolbar.displayName = 'Toolbar';

export default Toolbar;
