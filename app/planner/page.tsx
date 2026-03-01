'use client';

import { Card } from '@/components/Card';
import { ClientReady } from '@/components/ClientReady';
import { useMomentumStore } from '@/hooks/useMomentumStore';
import { WeeklyPlanner } from '@/types';

const dayMeta: Array<{ key: keyof WeeklyPlanner; title: string }> = [
  { key: 'monday', title: 'Monday' },
  { key: 'tuesday', title: 'Tuesday' },
  { key: 'wednesday', title: 'Wednesday' },
  { key: 'thursday', title: 'Thursday' },
  { key: 'friday', title: 'Friday' },
  { key: 'saturday', title: 'Saturday' },
  { key: 'sunday', title: 'Sunday' }
];

export default function PlannerPage() {
  const { data, setPlannerDay } = useMomentumStore();

  return (
    <ClientReady>
      <Card>
        <h2 className="text-lg font-semibold">Smart Weekly Planner</h2>
        <p className="text-sm text-muted">Template is prefilled. Edit each day with your task blocks.</p>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {dayMeta.map((day) => (
          <Card key={day.key}>
            <p className="mb-2 font-medium">{day.title}</p>
            <textarea
              value={data.planner[day.key]}
              onChange={(event) => setPlannerDay(day.key, event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border bg-panelSoft p-2 text-sm outline-none focus:border-accent2"
            />
          </Card>
        ))}
      </div>
    </ClientReady>
  );
}
