type Row = { label: string; value: number };

export default function HorizontalBarList({
  data,
  color = '#6366f1',
  emptyLabel = 'No data yet.',
}: {
  data: Row[];
  color?: string;
  emptyLabel?: string;
}) {
  if (!data.length) {
    return <p className="text-xs text-slate-400 py-3">{emptyLabel}</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <ul className="space-y-3.5">
      {data.map((d) => {
        const pct = Math.max((d.value / max) * 100, 4);
        return (
          <li key={d.label} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-700 truncate">{d.label}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                {d.value}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${color}, #a855f7)`,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

