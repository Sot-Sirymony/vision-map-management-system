export function PriorityBadge({ priority }: { priority: string }) {
  return <span className={`badge priority-${priority.toLowerCase()}`}>{priority}</span>;
}
