import MuiAlert from '@mui/material/Alert';

export function ErrorMessage({ message }: { message: string }) {
  return <MuiAlert severity="error">{message}</MuiAlert>;
}
