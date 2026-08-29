import React from 'react';
import { Tab as MuiTab, TabProps as MuiTabProps } from '@mui/material';

export type TabProps = MuiTabProps;

export const Tab = React.forwardRef<any, TabProps>((props, ref) => {
  return <MuiTab ref={ref} {...props} />;
});

Tab.displayName = 'Tab';

export default Tab;
