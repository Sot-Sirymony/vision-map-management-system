import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-shell">
      <section className="auth-panel">{children}</section>
    </main>
  );
}
