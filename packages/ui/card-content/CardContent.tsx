import React from 'react';
import { CardContent as MuiCardContent, CardContentProps as MuiCardContentProps } from '@mui/material';

export type CardContentProps = MuiCardContentProps;

export const CardContent = React.forwardRef<any, CardContentProps>((props, ref) => {
  return <MuiCardContent ref={ref} {...props} />;
});

CardContent.displayName = 'CardContent';

export default CardContent;
