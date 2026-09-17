type Row = { label: string; value: number };

export default function HorizontalBarList({
  data,
  color = '#7c3aed',
  emptyLabel = 'No data yet.',
}: {
  data: Row[];
  color?: string;
  emptyLabel?: string;
}) {
  if (!data.length) {
    return <p className="text-xs text-[var(--sd-subtle)]">{emptyLabel}</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label} className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-[var(--sd-ink)] truncate">{d.label}</span>
            <span className="text-[var(--sd-subtle)] shrink-0">{d.value}</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--sd-line-soft)] overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${(d.value / max) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
