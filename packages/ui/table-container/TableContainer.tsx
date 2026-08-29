import React from 'react';
import { TableContainer as MuiTableContainer, TableContainerProps as MuiTableContainerProps } from '@mui/material';

export type TableContainerProps = MuiTableContainerProps & { component?: React.ElementType; [key: string]: any };

export const TableContainer = React.forwardRef<any, TableContainerProps>((props, ref) => {
  return <MuiTableContainer ref={ref} {...props} />;
});

TableContainer.displayName = 'TableContainer';

export default TableContainer;
