import React from 'react';
import { Container as MuiContainer, ContainerProps as MuiContainerProps } from '@mui/material';

export type ContainerProps = MuiContainerProps;

export const Container = React.forwardRef<any, ContainerProps>((props, ref) => {
  return <MuiContainer ref={ref} {...props} />;
});

Container.displayName = 'Container';

export default Container;
