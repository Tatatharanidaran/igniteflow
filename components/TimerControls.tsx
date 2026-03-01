'use client';

import { useMemo } from 'react';
import { useMomentumStore } from '@/hooks/useMomentumStore';
import { formatDuration } from '@/lib/utils';
import { TimeCategory } from '@/types';

const categories: Array<{ key: TimeCategory; label: string; shortcut: string }> = [
  { key: 'trading', label: 'Trading', shortcut: 'Ctrl+Shift+1' },
  { key: 'building', label: 'Building', shortcut: 'Ctrl+Shift+2' },
  { key: 'seo', label: 'SEO', shortcut: 'Ctrl+Shift+3' }
];

export function TimerControls() {
  const { data, toggleTimer } = useMomentumStore();

  const elapsed = useMemo(() => {
    const now = Date.now();
    return {
      trading: data.activeTimers.trading ? now - new Date(data.activeTimers.trading).getTime() : 0,
      building: data.activeTimers.building ? now - new Date(data.activeTimers.building).getTime() : 0,
      seo: data.activeTimers.seo ? now - new Date(data.activeTimers.seo).getTime() : 0
    };
  }, [data.activeTimers]);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {categories.map((category) => {
        const active = Boolean(data.activeTimers[category.key]);
        return (
          <div key={category.key} className="rounded-xl border border-border bg-panelSoft p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium">{category.label}</p>
              <span className="text-xs text-muted">{category.shortcut}</span>
            </div>
            <p className="mb-3 font-mono text-lg">{formatDuration(elapsed[category.key])}</p>
            <button
              type="button"
              onClick={() => toggleTimer(category.key)}
              className={`w-full rounded-lg px-3 py-2 text-sm font-medium ${
                active ? 'bg-warning/20 text-warning' : 'bg-accent2/20 text-accent2'
              }`}
            >
              {active ? 'Stop Timer' : 'Start Timer'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
