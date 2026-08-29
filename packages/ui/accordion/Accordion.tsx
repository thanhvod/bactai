import React from 'react';
import { Accordion as MuiAccordion, AccordionProps as MuiAccordionProps } from '@mui/material';

export type AccordionProps = MuiAccordionProps;

export const Accordion = React.forwardRef<any, AccordionProps>((props, ref) => {
  return <MuiAccordion ref={ref} {...props} />;
});

Accordion.displayName = 'Accordion';

export default Accordion;
