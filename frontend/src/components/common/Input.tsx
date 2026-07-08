import type { InputHTMLAttributes } from 'react';
import TextField from '@mui/material/TextField';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'>;

export function Input({ min, max, minLength, maxLength, step, pattern, ...props }: InputProps) {
  return (
    <TextField
      variant="outlined"
      size="small"
      fullWidth
      slotProps={{ htmlInput: { min, max, minLength, maxLength, step, pattern } }}
      {...props}
    />
  );
}
