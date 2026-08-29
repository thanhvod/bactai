import React from 'react';
import { TableCell as MuiTableCell, TableCellProps as MuiTableCellProps } from '@mui/material';

export type TableCellProps = MuiTableCellProps;

export const TableCell = React.forwardRef<any, TableCellProps>((props, ref) => {
  return <MuiTableCell ref={ref} {...props} />;
});

TableCell.displayName = 'TableCell';

export default TableCell;
