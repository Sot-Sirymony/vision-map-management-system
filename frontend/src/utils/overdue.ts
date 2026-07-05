export function isOverdue(dueOrTargetDate: string | undefined, status: string): boolean {
  if (!dueOrTargetDate || status === 'COMPLETED') {
    return false;
  }
  return dueOrTargetDate < new Date().toISOString().slice(0, 10);
}
