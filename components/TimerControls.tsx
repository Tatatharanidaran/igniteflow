'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMomentumStore } from '@/hooks/useMomentumStore';
import { formatDuration } from '@/lib/utils';

const shortcutMap: Record<string, string> = {
  trading: 'Ctrl+Shift+1',
  building: 'Ctrl+Shift+2',
  seo: 'Ctrl+Shift+3'
};

export function TimerControls() {
  const { data, startTimer, pauseTimer, stopTimer, addTrackerCategory, removeTrackerCategory } =
    useMomentumStore();
  const [newCategory, setNewCategory] = useState('');
  const [message, setMessage] = useState('');
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const elapsed = useMemo(() => {
    const values: Record<string, number> = {};
    for (const category of data.trackerCategories) {
      const draft = data.timerDrafts[category.id] ?? {
        startedAt: null,
        firstStartedAt: null,
        accumulatedMs: 0
      };
      const activeStart = data.activeTimers[category.id];
      const runningMs = activeStart ? Math.max(0, nowMs - new Date(activeStart).getTime()) : 0;
      values[category.id] = draft.accumulatedMs + runningMs;
    }
    return values;
  }, [data.activeTimers, data.timerDrafts, data.trackerCategories, nowMs]);

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
          const draft = data.timerDrafts[category.id];
          const hasDraft = Boolean(draft && (draft.accumulatedMs > 0 || draft.firstStartedAt));
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
              {!active && !hasDraft ? (
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => startTimer(category.id)}
                    className="rounded-lg bg-accent2/20 px-3 py-2 text-sm font-medium text-accent2"
                  >
                    Start
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => (active ? pauseTimer(category.id) : startTimer(category.id))}
                    className="rounded-lg bg-panel px-3 py-2 text-sm font-medium text-text"
                  >
                    {active ? 'Pause' : 'Play'}
                  </button>
                  <button
                    type="button"
                    onClick={() => stopTimer(category.id)}
                    className="rounded-lg bg-warning/20 px-3 py-2 text-sm font-medium text-warning"
                  >
                    Stop
                  </button>
                </div>
              )}
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
