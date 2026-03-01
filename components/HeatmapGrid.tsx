export function HeatmapGrid({ data }: { data: Array<{ date: string; level: number }> }) {
  const levelColor = ['bg-panelSoft', 'bg-accent2/30', 'bg-accent2/55', 'bg-accent/70', 'bg-accent'];
  return (
    <div className="grid grid-cols-12 gap-1">
      {data.map((point) => (
        <div
          key={point.date}
          title={`${point.date}: level ${point.level}`}
          className={`aspect-square rounded-sm ${levelColor[point.level]}`}
        />
      ))}
    </div>
  );
}
