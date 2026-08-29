import React from 'react';
import { Slider as MuiSlider, SliderProps as MuiSliderProps } from '@mui/material';

export type SliderProps = MuiSliderProps;

export const Slider = React.forwardRef<any, SliderProps>((props, ref) => {
  return <MuiSlider ref={ref} {...props} />;
});

Slider.displayName = 'Slider';

export default Slider;
