import React from 'react';
import { Table as MuiTable, TableProps as MuiTableProps } from '@mui/material';

export type TableProps = MuiTableProps;

export const Table = React.forwardRef<any, TableProps>((props, ref) => {
  return <MuiTable ref={ref} {...props} />;
});

Table.displayName = 'Table';

export default Table;
