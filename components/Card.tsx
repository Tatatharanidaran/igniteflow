import { PropsWithChildren } from 'react';

export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <section className={`rounded-2xl border border-border bg-panel p-4 ${className}`}>{children}</section>;
}
