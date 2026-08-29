import React from 'react';
import { Popover as MuiPopover, PopoverProps as MuiPopoverProps } from '@mui/material';

export type PopoverProps = MuiPopoverProps;

export const Popover = React.forwardRef<any, PopoverProps>((props, ref) => {
  return <MuiPopover ref={ref} {...props} />;
});

Popover.displayName = 'Popover';

export default Popover;
