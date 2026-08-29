import React from 'react';
import { Skeleton as MuiSkeleton, SkeletonProps as MuiSkeletonProps } from '@mui/material';

export type SkeletonProps = MuiSkeletonProps;

export const Skeleton = React.forwardRef<any, SkeletonProps>((props, ref) => {
  return <MuiSkeleton ref={ref} {...props} />;
});

Skeleton.displayName = 'Skeleton';

export default Skeleton;
