import React from 'react';
import { Radio as MuiRadio, RadioProps as MuiRadioProps } from '@mui/material';

export type RadioProps = MuiRadioProps;

export const Radio = React.forwardRef<any, RadioProps>((props, ref) => {
  return <MuiRadio ref={ref} {...props} />;
});

Radio.displayName = 'Radio';

export default Radio;
