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
    return <p className="text-xs text-gray-400">{emptyLabel}</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label} className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-gray-700 truncate">{d.label}</span>
            <span className="text-gray-500 shrink-0">{d.value}</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
