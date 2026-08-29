import React from 'react';
import { Tooltip as MuiTooltip, TooltipProps as MuiTooltipProps } from '@mui/material';

export type TooltipProps = MuiTooltipProps;

export const Tooltip = React.forwardRef<any, TooltipProps>((props, ref) => {
  return <MuiTooltip ref={ref} {...props} />;
});

Tooltip.displayName = 'Tooltip';

export default Tooltip;
