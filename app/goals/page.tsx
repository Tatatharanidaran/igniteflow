'use client';

import { useMemo } from 'react';
import { Card } from '@/components/Card';
import { ClientReady } from '@/components/ClientReady';
import { ProgressRing } from '@/components/ProgressRing';
import { useMomentumStore } from '@/hooks/useMomentumStore';
import { clampPercent } from '@/lib/utils';

function percent(done: number, target: number) {
  if (target <= 0) return 0;
  return clampPercent((done / target) * 100);
}

export default function GoalsPage() {
  const { data, setGoals } = useMomentumStore();

  const progress = useMemo(
    () => ({
      tools: percent(data.goals.toolsDone, data.goals.toolsTarget),
      seo: percent(data.goals.seoPagesDone, data.goals.seoPagesTarget),
      improvements: percent(data.goals.improvementsDone, data.goals.improvementsTarget)
    }),
    [data.goals]
  );

  function updateNumber<K extends keyof typeof data.goals>(key: K, value: number) {
    setGoals({
      ...data.goals,
      [key]: Number.isFinite(value) ? Math.max(0, value) : 0
    });
  }

  return (
    <ClientReady>
      <Card>
        <h2 className="text-lg font-semibold">Monthly Goal Tracker</h2>
        <p className="text-sm text-muted">Set targets and track completion.</p>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="space-y-3">
          <p className="font-medium">Targets</p>
          <label className="grid gap-1 text-sm">
            <span className="text-muted">Tools to build</span>
            <input
              type="number"
              min={0}
              value={data.goals.toolsTarget}
              onChange={(event) => updateNumber('toolsTarget', Number(event.target.value))}
              className="rounded-lg border border-border bg-panelSoft px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-muted">SEO pages target</span>
            <input
              type="number"
              min={0}
              value={data.goals.seoPagesTarget}
              onChange={(event) => updateNumber('seoPagesTarget', Number(event.target.value))}
              className="rounded-lg border border-border bg-panelSoft px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-muted">Improvements target</span>
            <input
              type="number"
              min={0}
              value={data.goals.improvementsTarget}
              onChange={(event) => updateNumber('improvementsTarget', Number(event.target.value))}
              className="rounded-lg border border-border bg-panelSoft px-3 py-2"
            />
          </label>
        </Card>

        <Card className="space-y-3">
          <p className="font-medium">Completed</p>
          <label className="grid gap-1 text-sm">
            <span className="text-muted">Tools done</span>
            <input
              type="number"
              min={0}
              value={data.goals.toolsDone}
              onChange={(event) => updateNumber('toolsDone', Number(event.target.value))}
              className="rounded-lg border border-border bg-panelSoft px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-muted">SEO pages done</span>
            <input
              type="number"
              min={0}
              value={data.goals.seoPagesDone}
              onChange={(event) => updateNumber('seoPagesDone', Number(event.target.value))}
              className="rounded-lg border border-border bg-panelSoft px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-muted">Improvements done</span>
            <input
              type="number"
              min={0}
              value={data.goals.improvementsDone}
              onChange={(event) => updateNumber('improvementsDone', Number(event.target.value))}
              className="rounded-lg border border-border bg-panelSoft px-3 py-2"
            />
          </label>
        </Card>
      </div>

      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <ProgressRing label="Tools" value={progress.tools} />
          <ProgressRing label="SEO Pages" value={progress.seo} />
          <ProgressRing label="Improvements" value={progress.improvements} />
        </div>
      </Card>
    </ClientReady>
  );
}
