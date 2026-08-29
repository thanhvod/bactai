import React from 'react';
import { Chip as MuiChip, ChipProps as MuiChipProps } from '@mui/material';

export type ChipProps = MuiChipProps;

export const Chip = React.forwardRef<any, ChipProps>((props, ref) => {
  return <MuiChip ref={ref} {...props} />;
});

Chip.displayName = 'Chip';

export default Chip;
