import React from 'react';
import { AccordionActions as MuiAccordionActions, AccordionActionsProps as MuiAccordionActionsProps } from '@mui/material';

export type AccordionActionsProps = MuiAccordionActionsProps;

export const AccordionActions = React.forwardRef<any, AccordionActionsProps>((props, ref) => {
  return <MuiAccordionActions ref={ref} {...props} />;
});

AccordionActions.displayName = 'AccordionActions';

export default AccordionActions;
