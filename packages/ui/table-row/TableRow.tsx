import React from 'react';
import { TableRow as MuiTableRow, TableRowProps as MuiTableRowProps } from '@mui/material';

export type TableRowProps = MuiTableRowProps;

export const TableRow = React.forwardRef<any, TableRowProps>((props, ref) => {
  return <MuiTableRow ref={ref} {...props} />;
});

TableRow.displayName = 'TableRow';

export default TableRow;
