'use client';

import { BarGraph } from '@/components/BarGraph';
import { Card } from '@/components/Card';
import { ClientReady } from '@/components/ClientReady';
import { HeatmapGrid } from '@/components/HeatmapGrid';
import { useMomentumStore } from '@/hooks/useMomentumStore';
import { WEEKDAY_LABELS } from '@/lib/constants';
import { buildHeatmap, monthDayHours, weekDayHours } from '@/lib/utils';

export default function AnalyticsPage() {
  const { data } = useMomentumStore();
  const weekly = weekDayHours(data.logs);
  const monthly = monthDayHours(data.logs);
  const monthlyLabels = monthly.map((_, idx) => `${idx + 1}`);
  const monthlyMax = Math.max(4, ...monthly);
  const weeklyMax = Math.max(4, ...weekly);

  return (
    <ClientReady>
      <Card>
        <h2 className="text-lg font-semibold">Lightweight Analytics</h2>
        <p className="text-sm text-muted">Weekly and monthly output with a simple heatmap.</p>
      </Card>

      <Card>
        <p className="mb-3 text-sm text-muted">Weekly hours graph</p>
        <BarGraph values={weekly} labels={WEEKDAY_LABELS} max={weeklyMax} />
      </Card>

      <Card>
        <p className="mb-3 text-sm text-muted">Monthly hours graph</p>
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <BarGraph values={monthly} labels={monthlyLabels} max={monthlyMax} />
          </div>
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-sm text-muted">Productivity heatmap (last 12 weeks)</p>
        <HeatmapGrid data={buildHeatmap(data.logs, 84)} />
      </Card>
    </ClientReady>
  );
}
