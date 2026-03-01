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
import { AppSettings, MonthlyGoals, MomentumData, TimeCategory, TimeLog, WeeklyPlanner } from '@/types';

interface MomentumStore {
  data: MomentumData;
  loaded: boolean;
  setPlannerDay: (day: keyof WeeklyPlanner, value: string) => void;
  setGoals: (goals: MonthlyGoals) => void;
  setSettings: (settings: AppSettings) => void;
  startTimer: (category: TimeCategory) => void;
  stopTimer: (category: TimeCategory) => void;
  toggleTimer: (category: TimeCategory) => void;
  importData: (raw: string) => { ok: boolean; message: string };
  exportData: () => string;
  clearAll: () => void;
}

const MomentumContext = createContext<MomentumStore | null>(null);

function sanitizeImportedData(raw: unknown): MomentumData | null {
  if (!raw || typeof raw !== 'object') return null;
  const parsed = raw as Partial<MomentumData>;
  return {
    ...DEFAULT_DATA,
    ...parsed,
    planner: { ...DEFAULT_DATA.planner, ...parsed.planner },
    goals: { ...DEFAULT_DATA.goals, ...parsed.goals },
    settings: { ...DEFAULT_DATA.settings, ...parsed.settings },
    activeTimers: { ...DEFAULT_DATA.activeTimers, ...parsed.activeTimers },
    logs: Array.isArray(parsed.logs) ? parsed.logs : []
  };
}

export function MomentumProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<MomentumData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    const initial = loadData();
    setData(initial);
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

  const stopTimer = useCallback(
    (category: TimeCategory) => {
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
    },
    []
  );

  const toggleTimer = useCallback(
    (category: TimeCategory) => {
      const current = data.activeTimers[category];
      if (current) stopTimer(category);
      else startTimer(category);
    },
    [data.activeTimers, startTimer, stopTimer]
  );

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
      if (event.key === '1') toggleTimer('trading');
      if (event.key === '2') toggleTimer('building');
      if (event.key === '3') toggleTimer('seo');
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleTimer]);

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
