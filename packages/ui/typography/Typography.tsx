import React from 'react';
import { Typography as MuiTypography, TypographyProps as MuiTypographyProps } from '@mui/material';

export type TypographyProps = MuiTypographyProps & { component?: React.ElementType; [key: string]: any };

export const Typography = React.forwardRef<any, TypographyProps>((props, ref) => {
  return <MuiTypography ref={ref} {...props} />;
});

Typography.displayName = 'Typography';

export default Typography;
