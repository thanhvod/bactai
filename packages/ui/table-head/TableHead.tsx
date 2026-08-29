import React from 'react';
import { TableHead as MuiTableHead, TableHeadProps as MuiTableHeadProps } from '@mui/material';

export type TableHeadProps = MuiTableHeadProps;

export const TableHead = React.forwardRef<any, TableHeadProps>((props, ref) => {
  return <MuiTableHead ref={ref} {...props} />;
});

TableHead.displayName = 'TableHead';

export default TableHead;
