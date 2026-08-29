import React from 'react';
import { Pagination as MuiPagination, PaginationProps as MuiPaginationProps } from '@mui/material';

export type PaginationProps = MuiPaginationProps;

export const Pagination = React.forwardRef<any, PaginationProps>((props, ref) => {
  return <MuiPagination ref={ref} {...props} />;
});

Pagination.displayName = 'Pagination';

export default Pagination;
