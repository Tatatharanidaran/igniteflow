export type TimeCategory = string;

export type DayType = 'Workday' | 'Saturday' | 'Sunday';

export interface ScheduleBlock {
  label: string;
  start: string;
  end: string;
}

export interface TimeLog {
  id: string;
  category: TimeCategory;
  startIso: string;
  endIso: string;
  durationMs: number;
}

export interface TrackerCategory {
  id: string;
  label: string;
}

export interface WeeklyPlanner {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface MonthlyGoals {
  toolsTarget: number;
  seoPagesTarget: number;
  improvementsTarget: number;
  toolsDone: number;
  seoPagesDone: number;
  improvementsDone: number;
}

export interface AppSettings {
  dailyTradingTargetHours: number;
  dailyBuildTargetHours: number;
  deepWorkDays: number[];
}

export type ActiveTimers = Record<string, string | null>;

export interface MomentumData {
  logs: TimeLog[];
  trackerCategories: TrackerCategory[];
  planner: WeeklyPlanner;
  goals: MonthlyGoals;
  settings: AppSettings;
  activeTimers: ActiveTimers;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}
