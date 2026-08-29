import React from 'react';
import { Slide as MuiSlide, SlideProps as MuiSlideProps } from '@mui/material';

export type SlideProps = MuiSlideProps;

export const Slide = React.forwardRef<any, SlideProps>((props, ref) => {
  return <MuiSlide ref={ref} {...props} />;
});

Slide.displayName = 'Slide';

export default Slide;
