import React from 'react';
import { PaginationItem as MuiPaginationItem, PaginationItemProps as MuiPaginationItemProps } from '@mui/material';

export type PaginationItemProps = MuiPaginationItemProps;

export const PaginationItem = React.forwardRef<any, PaginationItemProps>((props, ref) => {
  return <MuiPaginationItem ref={ref} {...props} />;
});

PaginationItem.displayName = 'PaginationItem';

export default PaginationItem;
