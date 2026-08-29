import React from 'react';
import { Stack as MuiStack, StackProps as MuiStackProps } from '@mui/material';

export type StackProps = MuiStackProps;

export const Stack = React.forwardRef<any, StackProps>((props, ref) => {
  return <MuiStack ref={ref} {...props} />;
});

Stack.displayName = 'Stack';

export default Stack;
