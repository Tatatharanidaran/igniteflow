import { DEFAULT_DATA, STORAGE_KEY } from '@/lib/constants';
import { MomentumData } from '@/types';

export function loadData(): MomentumData {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<MomentumData>;
    return {
      ...DEFAULT_DATA,
      ...parsed,
      goals: { ...DEFAULT_DATA.goals, ...parsed.goals },
      planner: { ...DEFAULT_DATA.planner, ...parsed.planner },
      settings: { ...DEFAULT_DATA.settings, ...parsed.settings },
      activeTimers: { ...DEFAULT_DATA.activeTimers, ...parsed.activeTimers },
      logs: Array.isArray(parsed.logs) ? parsed.logs : []
    };
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveData(data: MomentumData): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData(): MomentumData {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_DATA;
}
