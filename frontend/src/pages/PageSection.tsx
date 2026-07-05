import type { ReactNode } from 'react';
import { EmptyState } from '../components/common/EmptyState';

type PageSectionProps = {
  title: string;
  subtitle: string;
  children?: ReactNode;
};

export function PageSection({ title, subtitle, children }: PageSectionProps) {
  return (
    <section className="page-section">
      <div className="page-heading">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children ?? <EmptyState>Records will appear here when connected to the API.</EmptyState>}
    </section>
  );
}
