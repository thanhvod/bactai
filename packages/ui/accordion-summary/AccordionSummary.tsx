import React from 'react';
import { AccordionSummary as MuiAccordionSummary, AccordionSummaryProps as MuiAccordionSummaryProps } from '@mui/material';

export type AccordionSummaryProps = MuiAccordionSummaryProps;

export const AccordionSummary = React.forwardRef<any, AccordionSummaryProps>((props, ref) => {
  return <MuiAccordionSummary ref={ref} {...props} />;
});

AccordionSummary.displayName = 'AccordionSummary';

export default AccordionSummary;
