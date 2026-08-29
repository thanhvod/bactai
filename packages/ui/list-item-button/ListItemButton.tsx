import React from 'react';
import { ListItemButton as MuiListItemButton, ListItemButtonProps as MuiListItemButtonProps } from '@mui/material';

export type ListItemButtonProps = MuiListItemButtonProps & { component?: React.ElementType; to?: string; [key: string]: any };

export const ListItemButton = React.forwardRef<any, ListItemButtonProps>((props, ref) => {
  return <MuiListItemButton ref={ref} {...props} />;
});

ListItemButton.displayName = 'ListItemButton';

export default ListItemButton;
