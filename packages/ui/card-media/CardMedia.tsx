import React from 'react';
import { CardMedia as MuiCardMedia, CardMediaProps as MuiCardMediaProps } from '@mui/material';

export type CardMediaProps = MuiCardMediaProps;

export const CardMedia = React.forwardRef<any, CardMediaProps>((props, ref) => {
  return <MuiCardMedia ref={ref} {...props} />;
});

CardMedia.displayName = 'CardMedia';

export default CardMedia;
