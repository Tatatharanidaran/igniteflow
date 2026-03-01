import { clampPercent } from '@/lib/utils';

export function ProgressBar({
  label,
  value,
  suffix = '%'
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  const safe = clampPercent(value);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted">
        <span>{label}</span>
        <span>{Math.round(safe)}{suffix}</span>
      </div>
      <div className="h-2 rounded-full bg-panelSoft">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-accent to-accent2 transition-all"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}
