import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, BreadcrumbsProps as MuiBreadcrumbsProps } from '@mui/material';

export type BreadcrumbsProps = MuiBreadcrumbsProps;

export const Breadcrumbs = React.forwardRef<any, BreadcrumbsProps>((props, ref) => {
  return <MuiBreadcrumbs ref={ref} {...props} />;
});

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;
