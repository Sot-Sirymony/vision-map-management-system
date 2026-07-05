import { Progress } from '@/components/ui/progress';

export function ProgressBar({ value }: { value: number }) {
  const percent = Math.min(100, Math.max(0, value));
  return <Progress value={percent} aria-label={`Progress ${percent}%`} className="progress w-full" />;
}
