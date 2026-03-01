import { DAY_SCHEDULES, WEEKDAY_KEYS } from '@/lib/constants';
import { Badge, DayType, TimeCategory, TimeLog, WeeklyPlanner } from '@/types';

export function getDayType(dayIndex: number): DayType {
  if (dayIndex === 6) return 'Saturday';
  if (dayIndex === 0) return 'Sunday';
  return 'Workday';
}

export function hoursFromMs(ms: number): number {
  return Math.round((ms / 3_600_000) * 10) / 10;
}

export function toHours(ms: number): number {
  return ms / 3_600_000;
}

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function sumCategoryMs(logs: TimeLog[], category: TimeCategory): number {
  return logs
    .filter((log) => log.category === category)
    .reduce((sum, log) => sum + log.durationMs, 0);
}

export function getWeekBounds(reference: Date): { start: Date; end: Date } {
  const d = new Date(reference);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return { start, end };
}

export function getMonthBounds(reference: Date): { start: Date; end: Date } {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 1);
  return { start, end };
}

export function filterLogsByRange(logs: TimeLog[], start: Date, end: Date): TimeLog[] {
  return logs.filter((log) => {
    const t = new Date(log.startIso).getTime();
    return t >= start.getTime() && t < end.getTime();
  });
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`;
}

export function getTodayPlannerKey(day: number): keyof WeeklyPlanner {
  return WEEKDAY_KEYS[day] as keyof WeeklyPlanner;
}

export function getSchedule(day: number) {
  return DAY_SCHEDULES[day] ?? [];
}

export function calculateDailyConsistency(logs: TimeLog[], settingsTargetHours: number): boolean {
  const totalMs = logs.reduce((sum, log) => sum + log.durationMs, 0);
  return toHours(totalMs) >= settingsTargetHours;
}

export function calculateDailyStreak(logs: TimeLog[], targetHours: number, daysBack = 90): number {
  const logsByDay = new Map<string, number>();

  for (const log of logs) {
    const dateKey = new Date(log.startIso).toISOString().slice(0, 10);
    logsByDay.set(dateKey, (logsByDay.get(dateKey) ?? 0) + log.durationMs);
  }

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < daysBack; i += 1) {
    const current = new Date(today);
    current.setDate(today.getDate() - i);
    const key = current.toISOString().slice(0, 10);
    const hours = toHours(logsByDay.get(key) ?? 0);
    if (hours >= targetHours) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateWeeklyStreak(
  logs: TimeLog[],
  weeklyGoalHours: number,
  weeksBack = 52
): number {
  let streak = 0;
  const now = new Date();

  for (let i = 0; i < weeksBack; i += 1) {
    const ref = new Date(now);
    ref.setDate(now.getDate() - i * 7);
    const { start, end } = getWeekBounds(ref);
    const weekLogs = filterLogsByRange(logs, start, end);
    const weekHours = toHours(weekLogs.reduce((sum, log) => sum + log.durationMs, 0));
    if (weekHours >= weeklyGoalHours) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function weekDayHours(logs: TimeLog[], reference = new Date()): number[] {
  const { start } = getWeekBounds(reference);
  const hours = Array(7).fill(0);

  for (const log of logs) {
    const date = new Date(log.startIso);
    const dayDiff = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
    if (dayDiff >= 0 && dayDiff < 7) {
      hours[dayDiff] += toHours(log.durationMs);
    }
  }

  return hours.map((value) => Math.round(value * 10) / 10);
}

export function monthDayHours(logs: TimeLog[], reference = new Date()): number[] {
  const { start, end } = getMonthBounds(reference);
  const totalDays = new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate();
  const buckets = Array(totalDays).fill(0);

  for (const log of logs) {
    const date = new Date(log.startIso);
    if (date >= start && date < end) {
      const idx = date.getDate() - 1;
      buckets[idx] += toHours(log.durationMs);
    }
  }

  return buckets.map((value) => Math.round(value * 10) / 10);
}

export function buildHeatmap(logs: TimeLog[], days = 84): Array<{ date: string; level: number }> {
  const map = new Map<string, number>();
  logs.forEach((log) => {
    const key = new Date(log.startIso).toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + log.durationMs);
  });

  const points: Array<{ date: string; level: number }> = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const hours = toHours(map.get(key) ?? 0);
    let level = 0;
    if (hours >= 4) level = 4;
    else if (hours >= 3) level = 3;
    else if (hours >= 2) level = 2;
    else if (hours > 0) level = 1;
    points.push({ date: key, level });
  }
  return points;
}

export function computeBadges(
  weeklyBuildHours: number,
  dailyStreak: number,
  weeklyStreak: number,
  totalHours: number
): Badge[] {
  return [
    {
      id: 'build-starter',
      title: 'Build Starter',
      description: 'Reach 5 build hours this week',
      unlocked: weeklyBuildHours >= 5
    },
    {
      id: 'focus-run',
      title: 'Focus Run',
      description: '3-day consistency streak',
      unlocked: dailyStreak >= 3
    },
    {
      id: 'week-warrior',
      title: 'Week Warrior',
      description: '2 full weeks in a row',
      unlocked: weeklyStreak >= 2
    },
    {
      id: 'hundred-club',
      title: '100h Club',
      description: 'Log 100 total hours',
      unlocked: totalHours >= 100
    }
  ];
}
