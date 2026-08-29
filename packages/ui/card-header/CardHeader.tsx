import React from 'react';
import { CardHeader as MuiCardHeader, CardHeaderProps as MuiCardHeaderProps } from '@mui/material';

export type CardHeaderProps = MuiCardHeaderProps;

export const CardHeader = React.forwardRef<any, CardHeaderProps>((props, ref) => {
  return <MuiCardHeader ref={ref} {...props} />;
});

CardHeader.displayName = 'CardHeader';

export default CardHeader;
