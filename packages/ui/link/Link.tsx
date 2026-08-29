import React from 'react';
import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';

export type LinkProps = MuiLinkProps & { component?: React.ElementType; to?: string; [key: string]: any };

export const Link = React.forwardRef<any, LinkProps>((props, ref) => {
  return <MuiLink ref={ref} {...props} />;
});

Link.displayName = 'Link';

export default Link;
