import { MomentumData, ScheduleBlock, TrackerCategory, WeeklyPlanner } from '@/types';

export const STORAGE_KEY = 'momentumos.v1';

export const WEEKDAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
] as const;

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DEFAULT_PLANNER: WeeklyPlanner = {
  monday: 'Light build',
  tuesday: 'Heavy build',
  wednesday: 'Hybrid',
  thursday: 'Heavy build',
  friday: 'Optimization',
  saturday: 'Flexible / Sprint',
  sunday: 'Deep Build'
};

export const DEFAULT_TRACKER_CATEGORIES: TrackerCategory[] = [
  { id: 'trading', label: 'Trading' },
  { id: 'building', label: 'Building' },
  { id: 'seo', label: 'SEO' },
  { id: 'elastic-search', label: 'Elastic Search (Office)' },
  { id: 'ai-academy', label: 'AI Academy (Office)' }
];

export const DEFAULT_DATA: MomentumData = {
  logs: [],
  trackerCategories: DEFAULT_TRACKER_CATEGORIES,
  planner: DEFAULT_PLANNER,
  goals: {
    toolsTarget: 3,
    seoPagesTarget: 20,
    improvementsTarget: 12,
    toolsDone: 0,
    seoPagesDone: 0,
    improvementsDone: 0
  },
  settings: {
    dailyTradingTargetHours: 1,
    dailyBuildTargetHours: 2,
    deepWorkDays: [0, 1, 2, 3, 4, 5]
  },
  activeTimers: DEFAULT_TRACKER_CATEGORIES.reduce<Record<string, string | null>>((acc, category) => {
    acc[category.id] = null;
    return acc;
  }, {}),
  timerDrafts: DEFAULT_TRACKER_CATEGORIES.reduce<
    Record<string, { startedAt: string | null; firstStartedAt: string | null; accumulatedMs: number }>
  >((acc, category) => {
    acc[category.id] = { startedAt: null, firstStartedAt: null, accumulatedMs: 0 };
    return acc;
  }, {})
};

export const DAY_SCHEDULES: Record<number, ScheduleBlock[]> = {
  0: [
    { label: 'Sunday Deep Work', start: '10:00', end: '15:00' }
  ],
  1: [
    { label: 'Work', start: '09:30', end: '19:00' },
    { label: 'Trading Learning', start: '20:30', end: '21:30' },
    { label: 'Platform Building', start: '21:30', end: '23:30' }
  ],
  2: [
    { label: 'Work', start: '09:30', end: '19:00' },
    { label: 'Trading Learning', start: '20:30', end: '21:30' },
    { label: 'Platform Building', start: '21:30', end: '23:30' }
  ],
  3: [
    { label: 'Work', start: '09:30', end: '19:00' },
    { label: 'Trading Learning', start: '20:30', end: '21:30' },
    { label: 'Platform Building', start: '21:30', end: '23:30' }
  ],
  4: [
    { label: 'Work', start: '09:30', end: '19:00' },
    { label: 'Trading Learning', start: '20:30', end: '21:30' },
    { label: 'Platform Building', start: '21:30', end: '23:30' }
  ],
  5: [
    { label: 'Work', start: '09:30', end: '19:00' },
    { label: 'Trading Learning', start: '20:30', end: '21:30' },
    { label: 'Platform Building', start: '21:30', end: '23:30' }
  ],
  6: [
    { label: 'Flexible Productivity', start: '10:00', end: '16:00' }
  ]
};
