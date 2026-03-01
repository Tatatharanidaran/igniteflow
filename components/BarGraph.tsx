import { clampPercent } from '@/lib/utils';

export function BarGraph({
  values,
  labels,
  max = 8
}: {
  values: number[];
  labels: string[];
  max?: number;
}) {
  return (
    <div className="grid grid-cols-7 gap-2 md:gap-3">
      {values.map((v, idx) => {
        const percent = clampPercent((v / max) * 100);
        return (
          <div key={`${labels[idx]}-${idx}`} className="flex flex-col items-center gap-2">
            <div className="flex h-36 w-full items-end rounded-md bg-panelSoft p-1">
              <div
                className="w-full rounded bg-gradient-to-t from-accent2 to-accent"
                style={{ height: `${Math.max(6, percent)}%` }}
              />
            </div>
            <p className="text-xs text-muted">{labels[idx]}</p>
            <p className="text-xs">{v.toFixed(1)}h</p>
          </div>
        );
      })}
    </div>
  );
}
