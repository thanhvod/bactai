import React from 'react';
import { IconButton as MuiIconButton, IconButtonProps as MuiIconButtonProps } from '@mui/material';

export type IconButtonProps = MuiIconButtonProps & { component?: React.ElementType; to?: string; [key: string]: any };

export const IconButton = React.forwardRef<any, IconButtonProps>((props, ref) => {
  return <MuiIconButton ref={ref} {...props} />;
});

IconButton.displayName = 'IconButton';

export default IconButton;
