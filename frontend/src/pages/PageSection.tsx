import type { ReactNode } from 'react';

type PageSectionProps = {
  title: string;
  subtitle: string;
  children?: ReactNode;
};

export function PageSection({ title, subtitle, children }: PageSectionProps) {
  return (
    <section className="page-section">
      <div className="page-heading">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {children ?? <div className="empty-state">Records will appear here when connected to the API.</div>}
    </section>
  );
}
