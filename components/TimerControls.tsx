'use client';

import { useMemo, useState } from 'react';
import { useMomentumStore } from '@/hooks/useMomentumStore';
import { formatDuration } from '@/lib/utils';

const shortcutMap: Record<string, string> = {
  trading: 'Ctrl+Shift+1',
  building: 'Ctrl+Shift+2',
  seo: 'Ctrl+Shift+3'
};

export function TimerControls() {
  const { data, toggleTimer, addTrackerCategory, removeTrackerCategory } = useMomentumStore();
  const [newCategory, setNewCategory] = useState('');
  const [message, setMessage] = useState('');

  const elapsed = useMemo(() => {
    const now = Date.now();
    const values: Record<string, number> = {};
    for (const category of data.trackerCategories) {
      const active = data.activeTimers[category.id];
      values[category.id] = active ? now - new Date(active).getTime() : 0;
    }
    return values;
  }, [data.activeTimers, data.trackerCategories]);

  function onAddCategory() {
    const result = addTrackerCategory(newCategory);
    setMessage(result.message);
    if (result.ok) {
      setNewCategory('');
    }
  }

  function onRemoveCategory(categoryId: string) {
    const result = removeTrackerCategory(categoryId);
    setMessage(result.message);
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        {data.trackerCategories.map((category) => {
          const active = Boolean(data.activeTimers[category.id]);
          return (
            <div key={category.id} className="rounded-xl border border-border bg-panelSoft p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-medium">{category.label}</p>
                <div className="flex items-center gap-2">
                  {shortcutMap[category.id] ? (
                    <span className="text-xs text-muted">{shortcutMap[category.id]}</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onRemoveCategory(category.id)}
                    className="rounded bg-warning/20 px-2 py-1 text-xs text-warning"
                    title="Remove category"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="mb-3 font-mono text-lg">{formatDuration(elapsed[category.id] ?? 0)}</p>
              <button
                type="button"
                onClick={() => toggleTimer(category.id)}
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

      <div className="rounded-xl border border-border bg-panelSoft p-3">
        <p className="mb-2 text-sm text-muted">Add new tracker category (future-proof)</p>
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="Example: Client Delivery"
            className="flex-1 rounded-lg border border-border bg-panel px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={onAddCategory}
            className="rounded-lg bg-accent2/20 px-3 py-2 text-sm text-accent2"
          >
            Add Category
          </button>
        </div>
        {message ? <p className="mt-2 text-xs text-muted">{message}</p> : null}
      </div>
    </div>
  );
}
