'use client';

import { Card } from '@/components/Card';
import { ClientReady } from '@/components/ClientReady';
import { TimerControls } from '@/components/TimerControls';
import { useMomentumStore } from '@/hooks/useMomentumStore';
import {
  calculateWeeklyStreak,
  filterLogsByRange,
  getWeekBounds,
  hoursFromMs,
  sumCategoryMs,
  toHours
} from '@/lib/utils';

export default function TrackerPage() {
  const { data } = useMomentumStore();
  const { start, end } = getWeekBounds(new Date());
  const weekLogs = filterLogsByRange(data.logs, start, end);

  const buildMs = sumCategoryMs(weekLogs, 'building');
  const tradeMs = sumCategoryMs(weekLogs, 'trading');
  const totalWeekHours = toHours(weekLogs.reduce((sum, log) => sum + log.durationMs, 0));
  const weeklyGoalHours =
    data.settings.deepWorkDays.length *
    (data.settings.dailyTradingTargetHours + data.settings.dailyBuildTargetHours);
  const weeklyStreak = calculateWeeklyStreak(data.logs, weeklyGoalHours || 1);

  return (
    <ClientReady>
      <Card>
        <h2 className="text-lg font-semibold">Time Block Tracker</h2>
        <p className="text-sm text-muted">Manual timers for Trading, Building, and SEO.</p>
      </Card>

      <TimerControls />

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Total build hours (week)</p>
          <p className="text-2xl font-semibold">{hoursFromMs(buildMs)}h</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Total trading hours (week)</p>
          <p className="text-2xl font-semibold">{hoursFromMs(tradeMs)}h</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Weekly streak</p>
          <p className="text-2xl font-semibold">{weeklyStreak} weeks</p>
          <p className="text-xs text-muted">Current week total: {totalWeekHours.toFixed(1)}h</p>
        </Card>
      </div>

      <Card>
        <p className="mb-2 text-sm text-muted">Recent time logs</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-muted">
                <th className="py-2">Category</th>
                <th className="py-2">Start</th>
                <th className="py-2">End</th>
                <th className="py-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              {[...data.logs]
                .reverse()
                .slice(0, 12)
                .map((log) => (
                  <tr key={log.id} className="border-t border-border">
                    <td className="py-2 capitalize">{log.category}</td>
                    <td className="py-2">{new Date(log.startIso).toLocaleString()}</td>
                    <td className="py-2">{new Date(log.endIso).toLocaleString()}</td>
                    <td className="py-2">{hoursFromMs(log.durationMs)}h</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </ClientReady>
  );
}
