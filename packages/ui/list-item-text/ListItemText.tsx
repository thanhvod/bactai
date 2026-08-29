import React from 'react';
import { ListItemText as MuiListItemText, ListItemTextProps as MuiListItemTextProps } from '@mui/material';

export type ListItemTextProps = MuiListItemTextProps;

export const ListItemText = React.forwardRef<any, ListItemTextProps>((props, ref) => {
  return <MuiListItemText ref={ref} {...props} />;
});

ListItemText.displayName = 'ListItemText';

export default ListItemText;
