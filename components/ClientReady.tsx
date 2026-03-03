'use client';

import { useMomentumStore } from '@/hooks/useMomentumStore';

export function ClientReady({ children }: { children: React.ReactNode }) {
  const { loaded } = useMomentumStore();

  if (!loaded) {
    return (
      <div className="rounded-xl border border-border bg-panel p-4 text-sm text-muted">
        Loading IngniteFlow...
      </div>
    );
  }

  return <>{children}</>;
}
