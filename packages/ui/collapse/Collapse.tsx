import React from 'react';
import { Collapse as MuiCollapse, CollapseProps as MuiCollapseProps } from '@mui/material';

export type CollapseProps = MuiCollapseProps;

export const Collapse = React.forwardRef<any, CollapseProps>((props, ref) => {
  return <MuiCollapse ref={ref} {...props} />;
});

Collapse.displayName = 'Collapse';

export default Collapse;
