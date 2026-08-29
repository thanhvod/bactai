import React from 'react';
import { CardActions as MuiCardActions, CardActionsProps as MuiCardActionsProps } from '@mui/material';

export type CardActionsProps = MuiCardActionsProps;

export const CardActions = React.forwardRef<any, CardActionsProps>((props, ref) => {
  return <MuiCardActions ref={ref} {...props} />;
});

CardActions.displayName = 'CardActions';

export default CardActions;
