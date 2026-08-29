import React from 'react';
import { ListItem as MuiListItem, ListItemProps as MuiListItemProps } from '@mui/material';

export type ListItemProps = MuiListItemProps & { component?: React.ElementType; [key: string]: any };

export const ListItem = React.forwardRef<any, ListItemProps>((props, ref) => {
  return <MuiListItem ref={ref} {...props} />;
});

ListItem.displayName = 'ListItem';

export default ListItem;
