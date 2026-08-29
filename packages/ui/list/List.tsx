import React from 'react';
import { List as MuiList, ListProps as MuiListProps } from '@mui/material';

export type ListProps = MuiListProps;

export const List = React.forwardRef<any, ListProps>((props, ref) => {
  return <MuiList ref={ref} {...props} />;
});

List.displayName = 'List';

export default List;
