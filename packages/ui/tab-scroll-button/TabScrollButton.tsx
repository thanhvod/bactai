import React from 'react';
import { TabScrollButton as MuiTabScrollButton, TabScrollButtonProps as MuiTabScrollButtonProps } from '@mui/material';

export type TabScrollButtonProps = MuiTabScrollButtonProps;

export const TabScrollButton = React.forwardRef<any, TabScrollButtonProps>((props, ref) => {
  return <MuiTabScrollButton ref={ref} {...props} />;
});

TabScrollButton.displayName = 'TabScrollButton';

export default TabScrollButton;
