export function ProgressBar({ value }: { value: number }) {
  const percent = Math.min(100, Math.max(0, value));
  return (
    <div className="progress" aria-label={`Progress ${percent}%`}>
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}
