import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
};

const VARIANT_MAP = {
  primary: 'default',
  secondary: 'secondary',
  danger: 'destructive',
} as const;

export function Button({ variant = 'primary', children, type = 'button', ...props }: ButtonProps) {
  return (
    <ShadcnButton variant={VARIANT_MAP[variant]} type={type} {...props}>
      {children}
    </ShadcnButton>
  );
}
