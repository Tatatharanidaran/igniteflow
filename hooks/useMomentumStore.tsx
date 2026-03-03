'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { DEFAULT_DATA } from '@/lib/constants';
import { loadData, resetData, saveData } from '@/lib/storage';
import {
  AppSettings,
  MonthlyGoals,
  MomentumData,
  TimeCategory,
  TimeLog,
  TrackerCategory,
  WeeklyPlanner
} from '@/types';

interface MomentumStore {
  data: MomentumData;
  loaded: boolean;
  setPlannerDay: (day: keyof WeeklyPlanner, value: string) => void;
  setGoals: (goals: MonthlyGoals) => void;
  setSettings: (settings: AppSettings) => void;
  startTimer: (category: TimeCategory) => void;
  stopTimer: (category: TimeCategory) => void;
  toggleTimer: (category: TimeCategory) => void;
  addTrackerCategory: (label: string) => { ok: boolean; message: string };
  removeTrackerCategory: (categoryId: string) => { ok: boolean; message: string };
  importData: (raw: string) => { ok: boolean; message: string };
  exportData: () => string;
  clearAll: () => void;
}

const MomentumContext = createContext<MomentumStore | null>(null);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeData(raw: Partial<MomentumData>): MomentumData {
  const parsedCategories = Array.isArray(raw.trackerCategories)
    ? raw.trackerCategories.filter(
        (item): item is TrackerCategory =>
          Boolean(item && typeof item.id === 'string' && typeof item.label === 'string')
      )
    : DEFAULT_DATA.trackerCategories;
  const trackerCategories = parsedCategories.length > 0 ? parsedCategories : DEFAULT_DATA.trackerCategories;

  const activeTimers = {
    ...DEFAULT_DATA.activeTimers,
    ...(raw.activeTimers ?? {})
  };

  for (const category of trackerCategories) {
    if (!(category.id in activeTimers)) {
      activeTimers[category.id] = null;
    }
  }

  return {
    ...DEFAULT_DATA,
    ...raw,
    trackerCategories,
    planner: { ...DEFAULT_DATA.planner, ...raw.planner },
    goals: { ...DEFAULT_DATA.goals, ...raw.goals },
    settings: { ...DEFAULT_DATA.settings, ...raw.settings },
    activeTimers,
    logs: Array.isArray(raw.logs) ? raw.logs : []
  };
}

function sanitizeImportedData(raw: unknown): MomentumData | null {
  if (!raw || typeof raw !== 'object') return null;
  return normalizeData(raw as Partial<MomentumData>);
}

export function MomentumProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<MomentumData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    const initial = loadData();
    setData(normalizeData(initial));
    setLoaded(true);
    loadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    saveData(data);
  }, [data]);

  const startTimer = useCallback((category: TimeCategory) => {
    setData((prev) => {
      if (prev.activeTimers[category]) return prev;
      return {
        ...prev,
        activeTimers: {
          ...prev.activeTimers,
          [category]: new Date().toISOString()
        }
      };
    });
  }, []);

  const stopTimer = useCallback((category: TimeCategory) => {
    setData((prev) => {
      const active = prev.activeTimers[category];
      if (!active) return prev;

      const start = new Date(active);
      const end = new Date();
      const durationMs = Math.max(0, end.getTime() - start.getTime());

      if (durationMs < 1000) {
        return {
          ...prev,
          activeTimers: {
            ...prev.activeTimers,
            [category]: null
          }
        };
      }

      const nextLog: TimeLog = {
        id: `${category}-${Date.now()}`,
        category,
        startIso: start.toISOString(),
        endIso: end.toISOString(),
        durationMs
      };

      return {
        ...prev,
        logs: [...prev.logs, nextLog],
        activeTimers: {
          ...prev.activeTimers,
          [category]: null
        }
      };
    });
  }, []);

  const toggleTimer = useCallback(
    (category: TimeCategory) => {
      const current = data.activeTimers[category];
      if (current) stopTimer(category);
      else startTimer(category);
    },
    [data.activeTimers, startTimer, stopTimer]
  );

  const addTrackerCategory = useCallback((label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return { ok: false, message: 'Category name is required' };

    const baseId = slugify(trimmed);
    if (!baseId) return { ok: false, message: 'Category name is invalid' };

    let result = { ok: true, message: 'Category added' };
    setData((prev) => {
      const duplicateLabel = prev.trackerCategories.some(
        (category) => category.label.toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicateLabel) {
        result = { ok: false, message: 'Category already exists' };
        return prev;
      }

      let id = baseId;
      let suffix = 2;
      while (prev.trackerCategories.some((category) => category.id === id)) {
        id = `${baseId}-${suffix}`;
        suffix += 1;
      }

      return {
        ...prev,
        trackerCategories: [...prev.trackerCategories, { id, label: trimmed }],
        activeTimers: {
          ...prev.activeTimers,
          [id]: null
        }
      };
    });

    return result;
  }, []);

  const removeTrackerCategory = useCallback((categoryId: string) => {
    let result = { ok: true, message: 'Category removed' };

    setData((prev) => {
      const existing = prev.trackerCategories.find((category) => category.id === categoryId);
      if (!existing) {
        result = { ok: false, message: 'Category not found' };
        return prev;
      }

      if (prev.activeTimers[categoryId]) {
        result = { ok: false, message: 'Stop the active timer before removing this category' };
        return prev;
      }

      const remainingCategories = prev.trackerCategories.filter((category) => category.id !== categoryId);
      if (remainingCategories.length === 0) {
        result = { ok: false, message: 'At least one tracker category is required' };
        return prev;
      }

      const { [categoryId]: _, ...remainingTimers } = prev.activeTimers;

      return {
        ...prev,
        trackerCategories: remainingCategories,
        activeTimers: remainingTimers
      };
    });

    return result;
  }, []);

  const setPlannerDay = useCallback((day: keyof WeeklyPlanner, value: string) => {
    setData((prev) => ({
      ...prev,
      planner: {
        ...prev.planner,
        [day]: value
      }
    }));
  }, []);

  const setGoals = useCallback((goals: MonthlyGoals) => {
    setData((prev) => ({ ...prev, goals }));
  }, []);

  const setSettings = useCallback((settings: AppSettings) => {
    setData((prev) => ({ ...prev, settings }));
  }, []);

  const exportData = useCallback(() => JSON.stringify(data, null, 2), [data]);

  const importData = useCallback((raw: string) => {
    try {
      const parsed = JSON.parse(raw) as unknown;
      const sanitized = sanitizeImportedData(parsed);
      if (!sanitized) {
        return { ok: false, message: 'Invalid JSON schema' };
      }
      setData(sanitized);
      return { ok: true, message: 'Data imported' };
    } catch {
      return { ok: false, message: 'Unable to parse JSON' };
    }
  }, []);

  const clearAll = useCallback(() => {
    setData(resetData());
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!event.ctrlKey || !event.shiftKey) return;
      const hasCategory = (id: string) => data.trackerCategories.some((category) => category.id === id);
      if (event.key === '1' && hasCategory('trading')) toggleTimer('trading');
      if (event.key === '2' && hasCategory('building')) toggleTimer('building');
      if (event.key === '3' && hasCategory('seo')) toggleTimer('seo');
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [data.trackerCategories, toggleTimer]);

  useEffect(() => {
    const hasAnyActive = Object.values(data.activeTimers).some(Boolean);
    if (!hasAnyActive) return;

    const interval = window.setInterval(() => {
      setData((prev) => ({ ...prev }));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [data.activeTimers]);

  const value = useMemo<MomentumStore>(
    () => ({
      data,
      loaded,
      setPlannerDay,
      setGoals,
      setSettings,
      startTimer,
      stopTimer,
      toggleTimer,
      addTrackerCategory,
      removeTrackerCategory,
      importData,
      exportData,
      clearAll
    }),
    [
      data,
      loaded,
      setPlannerDay,
      setGoals,
      setSettings,
      startTimer,
      stopTimer,
      toggleTimer,
      addTrackerCategory,
      removeTrackerCategory,
      importData,
      exportData,
      clearAll
    ]
  );

  return <MomentumContext.Provider value={value}>{children}</MomentumContext.Provider>;
}

export function useMomentumStore() {
  const ctx = useContext(MomentumContext);
  if (!ctx) {
    throw new Error('useMomentumStore must be used within MomentumProvider');
  }
  return ctx;
}
