import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

type DashboardCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

export function DashboardCard({ label, value, icon: Icon }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardDescription>{label}</CardDescription>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardTitle className="px-(--card-spacing) text-2xl font-semibold">{value}</CardTitle>
    </Card>
  );
}
