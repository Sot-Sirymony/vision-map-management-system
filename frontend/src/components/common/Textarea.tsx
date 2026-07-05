import type { TextareaHTMLAttributes } from 'react';
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea';

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <ShadcnTextarea {...props} />;
}
