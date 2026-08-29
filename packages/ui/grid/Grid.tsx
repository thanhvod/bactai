import React from 'react';
import { Grid as MuiGrid, GridProps as MuiGridProps } from '@mui/material';

export type GridProps = MuiGridProps;

export const Grid = React.forwardRef<any, GridProps>((props, ref) => {
  return <MuiGrid ref={ref} {...props} />;
});

Grid.displayName = 'Grid';

export default Grid;
