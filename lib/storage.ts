import { DEFAULT_DATA, STORAGE_KEY } from '@/lib/constants';
import { MomentumData } from '@/types';

export function loadData(): MomentumData {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<MomentumData>;
    const parsedCategories = Array.isArray(parsed.trackerCategories)
      ? parsed.trackerCategories.filter(
          (item): item is { id: string; label: string } =>
            Boolean(item && typeof item.id === 'string' && typeof item.label === 'string')
        )
      : DEFAULT_DATA.trackerCategories;
    const trackerCategories = parsedCategories.length > 0 ? parsedCategories : DEFAULT_DATA.trackerCategories;
    const activeTimers = {
      ...DEFAULT_DATA.activeTimers,
      ...(parsed.activeTimers ?? {})
    };
    const timerDrafts = {
      ...DEFAULT_DATA.timerDrafts,
      ...(parsed.timerDrafts ?? {})
    };
    for (const category of trackerCategories) {
      if (!(category.id in activeTimers)) {
        activeTimers[category.id] = null;
      }
      if (!(category.id in timerDrafts)) {
        timerDrafts[category.id] = { startedAt: null, firstStartedAt: null, accumulatedMs: 0 };
      }
    }

    return {
      ...DEFAULT_DATA,
      ...parsed,
      trackerCategories,
      goals: { ...DEFAULT_DATA.goals, ...parsed.goals },
      planner: { ...DEFAULT_DATA.planner, ...parsed.planner },
      settings: { ...DEFAULT_DATA.settings, ...parsed.settings },
      activeTimers,
      timerDrafts,
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
