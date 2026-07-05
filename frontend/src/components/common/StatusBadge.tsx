export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge status-${status.toLowerCase().replaceAll('_', '-')}`}>{status.replaceAll('_', ' ')}</span>;
}
