import React from 'react';
import { ListSubheader as MuiListSubheader, ListSubheaderProps as MuiListSubheaderProps } from '@mui/material';

export type ListSubheaderProps = MuiListSubheaderProps;

export const ListSubheader = React.forwardRef<any, ListSubheaderProps>((props, ref) => {
  return <MuiListSubheader ref={ref} {...props} />;
});

ListSubheader.displayName = 'ListSubheader';

export default ListSubheader;
