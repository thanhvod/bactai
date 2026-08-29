import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps } from '@mui/material';

export type CardProps = MuiCardProps;

export const Card = React.forwardRef<any, CardProps>((props, ref) => {
  return <MuiCard ref={ref} {...props} />;
});

Card.displayName = 'Card';

export default Card;
