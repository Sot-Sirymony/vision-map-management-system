import MuiAlert from '@mui/material/Alert';
import MuiButton from '@mui/material/Button';

type ErrorMessageProps = {
  message: string;
  /**
   * FR-20.3: a failed load should offer the fix, not just the fact. When
   * provided, the alert carries a Retry action wired to the page's reload.
   */
  onRetry?: () => void;
};

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <MuiAlert
      severity="error"
      action={
        onRetry && (
          <MuiButton color="inherit" size="small" onClick={onRetry}>
            Retry
          </MuiButton>
        )
      }
    >
      {message}
    </MuiAlert>
  );
}
