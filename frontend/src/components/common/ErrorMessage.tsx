import { Alert, AlertDescription } from '@/components/ui/alert';

export function ErrorMessage({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="error-message">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
