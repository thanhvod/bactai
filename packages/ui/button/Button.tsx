import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, styled } from '@mui/material';

export type ButtonProps = MuiButtonProps & { component?: React.ElementType; to?: string; [key: string]: any };

const StyledButton = styled(MuiButton)<ButtonProps>(({ variant, disabled, theme }) => ({
  textTransform: 'none',
  fontWeight: 'bold',
  borderRadius: '6px',
  ...(variant === 'contained' && {
    background: disabled ? theme.palette.action.disabledBackground : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: disabled ? theme.palette.action.disabled : theme.palette.common.white,
    boxShadow: disabled ? 'none' : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '&:hover': {
      background: disabled ? theme.palette.action.disabledBackground : 'linear-gradient(135deg, #2563eb, #7c3aed)',
      boxShadow: disabled ? 'none' : '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
  }),
}));

export const Button = React.forwardRef<any, ButtonProps>((props, ref) => {
  return <StyledButton ref={ref} {...props} />;
});

Button.displayName = 'Button';

export default Button;
