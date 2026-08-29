import React from 'react';
import { Rating as MuiRating, RatingProps as MuiRatingProps } from '@mui/material';

export type RatingProps = MuiRatingProps;

export const Rating = React.forwardRef<any, RatingProps>((props, ref) => {
  return <MuiRating ref={ref} {...props} />;
});

Rating.displayName = 'Rating';

export default Rating;
