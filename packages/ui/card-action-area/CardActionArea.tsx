import React from 'react';
import { CardActionArea as MuiCardActionArea, CardActionAreaProps as MuiCardActionAreaProps } from '@mui/material';

export type CardActionAreaProps = MuiCardActionAreaProps;

export const CardActionArea = React.forwardRef<any, CardActionAreaProps>((props, ref) => {
  return <MuiCardActionArea ref={ref} {...props} />;
});

CardActionArea.displayName = 'CardActionArea';

export default CardActionArea;
