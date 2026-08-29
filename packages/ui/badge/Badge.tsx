import React from 'react';
import { Badge as MuiBadge, BadgeProps as MuiBadgeProps } from '@mui/material';

export type BadgeProps = MuiBadgeProps;

export const Badge = React.forwardRef<any, BadgeProps>((props, ref) => {
  return <MuiBadge ref={ref} {...props} />;
});

Badge.displayName = 'Badge';

export default Badge;
