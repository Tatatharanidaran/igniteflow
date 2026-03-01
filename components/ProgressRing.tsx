import { clampPercent } from '@/lib/utils';

export function ProgressRing({ label, value }: { label: string; value: number }) {
  const safe = clampPercent(value);
  const radius = 42;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (safe / 100) * circumference;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-panelSoft p-3">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="#243659"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#4dd0a9"
          fill="transparent"
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="text-lg font-semibold">{Math.round(safe)}%</p>
      </div>
    </div>
  );
}
