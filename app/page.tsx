'use client';

import { BadgeList } from '@/components/BadgeList';
import { Card } from '@/components/Card';
import { ClientReady } from '@/components/ClientReady';
import { ProgressBar } from '@/components/ProgressBar';
import { useMomentumStore } from '@/hooks/useMomentumStore';
import { WEEKDAY_LABELS } from '@/lib/constants';
import {
  calculateDailyStreak,
  calculateWeeklyStreak,
  computeBadges,
  filterLogsByRange,
  formatDateLong,
  getDayType,
  getSchedule,
  getTodayPlannerKey,
  getWeekBounds,
  hoursFromMs,
  sumCategoryMs,
  toHours
} from '@/lib/utils';

export default function DashboardPage() {
  const { data } = useMomentumStore();
  const today = new Date();
  const day = today.getDay();
  const { start, end } = getWeekBounds(today);
  const weekLogs = filterLogsByRange(data.logs, start, end);

  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(todayStart.getDate() + 1);
  const todayLogs = filterLogsByRange(data.logs, todayStart, tomorrow);

  const tradingTodayHours = toHours(sumCategoryMs(todayLogs, 'trading'));
  const buildingTodayHours = toHours(sumCategoryMs(todayLogs, 'building'));

  const tradingProgress = (tradingTodayHours / data.settings.dailyTradingTargetHours) * 100;
  const buildingProgress = (buildingTodayHours / data.settings.dailyBuildTargetHours) * 100;

  const weeklyHours = toHours(weekLogs.reduce((sum, log) => sum + log.durationMs, 0));
  const weeklyGoalHours =
    data.settings.deepWorkDays.length *
    (data.settings.dailyTradingTargetHours + data.settings.dailyBuildTargetHours);
  const weeklyCompletion = weeklyGoalHours > 0 ? (weeklyHours / weeklyGoalHours) * 100 : 0;

  const weeklyBuildHours = toHours(sumCategoryMs(weekLogs, 'building'));
  const dailyTarget = data.settings.dailyTradingTargetHours + data.settings.dailyBuildTargetHours;
  const dailyStreak = calculateDailyStreak(data.logs, dailyTarget);
  const weeklyStreak = calculateWeeklyStreak(data.logs, weeklyGoalHours || 1);
  const totalHours = toHours(data.logs.reduce((sum, log) => sum + log.durationMs, 0));
  const badges = computeBadges(weeklyBuildHours, dailyStreak, weeklyStreak, totalHours);

  const todayKey = getTodayPlannerKey(day);

  const weekDayTotals = Array.from({ length: 7 }, (_, idx) => {
    const current = new Date(start);
    current.setDate(start.getDate() + idx);
    const next = new Date(current);
    next.setDate(current.getDate() + 1);
    const logs = filterLogsByRange(data.logs, current, next);
    return toHours(logs.reduce((sum, log) => sum + log.durationMs, 0));
  });

  return (
    <ClientReady>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <p className="text-sm text-muted">Today</p>
          <h2 className="text-xl font-semibold">{formatDateLong(today)}</h2>
          <p className="mt-1 text-sm text-accent2">{getDayType(day)}</p>
          <p className="mt-3 text-sm text-muted">Planner focus: {data.planner[todayKey]}</p>
        </Card>

        <Card>
          <p className="text-sm text-muted">Motivation</p>
          <h3 className="mt-1 text-lg font-semibold">You built {hoursFromMs(sumCategoryMs(weekLogs, 'building'))} hours this week.</h3>
        </Card>
      </div>

      <Card>
        <p className="mb-3 text-sm text-muted">Today&apos;s Schedule Blocks</p>
        <div className="grid gap-2 md:grid-cols-3">
          {getSchedule(day).map((block) => (
            <div key={`${block.label}-${block.start}`} className="rounded-lg border border-border bg-panelSoft p-3">
              <p className="font-medium">{block.label}</p>
              <p className="text-sm text-muted">
                {block.start} - {block.end}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <ProgressBar label="Trading Learning" value={tradingProgress} />
        <ProgressBar label="Platform Building" value={buildingProgress} />
        <ProgressBar label="Weekly Completion" value={weeklyCompletion} />
      </Card>

      <Card>
        <p className="mb-3 text-sm text-muted">Week Consistency</p>
        <div className="grid grid-cols-7 gap-2">
          {weekDayTotals.map((hours, idx) => {
            const missed = hours < dailyTarget;
            return (
              <div
                key={WEEKDAY_LABELS[idx]}
                className={`rounded-lg border p-2 text-center ${
                  missed ? 'border-warning/40 bg-warning/10' : 'border-accent/40 bg-accent/10'
                }`}
              >
                <p className="text-xs text-muted">{WEEKDAY_LABELS[idx]}</p>
                <p className="text-sm font-semibold">{hours.toFixed(1)}h</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-sm text-muted">Badges</p>
        <BadgeList badges={badges} />
      </Card>
    </ClientReady>
  );
}
