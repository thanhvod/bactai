import React from 'react';
import { TableBody as MuiTableBody, TableBodyProps as MuiTableBodyProps } from '@mui/material';

export type TableBodyProps = MuiTableBodyProps;

export const TableBody = React.forwardRef<any, TableBodyProps>((props, ref) => {
  return <MuiTableBody ref={ref} {...props} />;
});

TableBody.displayName = 'TableBody';

export default TableBody;
