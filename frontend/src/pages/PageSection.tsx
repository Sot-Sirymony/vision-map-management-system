import type { ReactNode } from 'react';
import { EmptyState } from '../components/common/EmptyState';

type PageSectionProps = {
  title: string;
  subtitle: string;
  /** Primary page action(s), right-aligned in the title row (FR-20.2 page template). */
  actions?: ReactNode;
  children?: ReactNode;
};

// The standard page anatomy: exactly one <h1> per page (axe
// `page-has-heading-one`), subtitle under it, primary action in the title row.
export function PageSection({ title, subtitle, actions, children }: PageSectionProps) {
  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {actions && <div className="page-heading-actions">{actions}</div>}
      </div>
      {children ?? <EmptyState>Records will appear here when connected to the API.</EmptyState>}
    </section>
  );
}
