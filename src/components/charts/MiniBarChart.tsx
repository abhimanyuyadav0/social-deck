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
        <div key={d.key} className="flex-1 min-w-0 h-full flex flex-col items-center justify-end gap-1">
          <div
            title={`${d.value} post${d.value === 1 ? '' : 's'}`}
            className="w-full rounded-t"
            style={{
              height: d.value ? `${Math.max((d.value / max) * 100, 6)}%` : '2px',
              backgroundColor: d.value ? color : 'var(--sd-line, #e5e7eb)',
            }}
          />
          <span className="text-[9px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
