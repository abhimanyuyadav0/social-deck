type Bar = { key: string; label: string; value: number };

export default function MiniBarChart({
  data,
  color = '#7c3aed',
  height = 120,
}: {
  data: Bar[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d) => (
        <div key={d.key} className="flex-1 min-w-0 h-full flex flex-col items-center justify-end gap-1.5 group">
          <div
            title={`${d.value} post${d.value === 1 ? '' : 's'}`}
            className="w-full rounded-t-md transition-[filter] duration-150 group-hover:brightness-110"
            style={{
              height: d.value ? `${Math.max((d.value / max) * 100, 6)}%` : '2px',
              background: d.value ? `linear-gradient(180deg, ${color}, ${color}cc)` : 'var(--sd-line-soft, #f1e4fb)',
            }}
          />
          <span className="text-[9px] text-[var(--sd-subtle)]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
