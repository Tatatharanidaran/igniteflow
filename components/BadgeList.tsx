import { Badge } from '@/types';

export function BadgeList({ badges }: { badges: Badge[] }) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`rounded-xl border p-3 ${
            badge.unlocked ? 'border-accent/40 bg-accent/10' : 'border-border bg-panelSoft'
          }`}
        >
          <p className="font-medium">{badge.title}</p>
          <p className="text-xs text-muted">{badge.description}</p>
          <p className="mt-1 text-xs">
            {badge.unlocked ? (
              <span className="text-accent">Unlocked</span>
            ) : (
              <span className="text-muted">Locked</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
