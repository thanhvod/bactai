import React from 'react';
import { AccordionDetails as MuiAccordionDetails, AccordionDetailsProps as MuiAccordionDetailsProps } from '@mui/material';

export type AccordionDetailsProps = MuiAccordionDetailsProps;

export const AccordionDetails = React.forwardRef<any, AccordionDetailsProps>((props, ref) => {
  return <MuiAccordionDetails ref={ref} {...props} />;
});

AccordionDetails.displayName = 'AccordionDetails';

export default AccordionDetails;
