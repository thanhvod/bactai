import React from 'react';
import { Tabs as MuiTabs, TabsProps as MuiTabsProps } from '@mui/material';

export type TabsProps = MuiTabsProps;

export const Tabs = React.forwardRef<any, TabsProps>((props, ref) => {
  return <MuiTabs ref={ref} {...props} />;
});

Tabs.displayName = 'Tabs';

export default Tabs;
