import type { ButtonHTMLAttributes, ReactNode } from 'react';
import MuiButton from '@mui/material/Button';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
};

const VARIANT_MAP: Record<'primary' | 'secondary' | 'danger', { variant: 'contained'; color: 'primary' | 'secondary' | 'error' }> = {
  primary: { variant: 'contained', color: 'primary' },
  secondary: { variant: 'contained', color: 'secondary' },
  danger: { variant: 'contained', color: 'error' },
};

export function Button({ variant = 'primary', children, type = 'button', color: _nativeColor, ...props }: ButtonProps) {
  const { variant: muiVariant, color } = VARIANT_MAP[variant];
  return (
    <MuiButton variant={muiVariant} color={color} type={type} size="small" {...props}>
      {children}
    </MuiButton>
  );
}
