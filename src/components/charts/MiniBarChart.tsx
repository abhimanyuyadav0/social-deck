type Bar = { key: string; label: string; value: number };

export default function MiniBarChart({
  data,
  color = '#6366f1',
  height = 130,
}: {
  data: Bar[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex items-end gap-1.5 pt-2" style={{ height }}>
      {data.map((d) => {
        const heightPct = d.value ? Math.max((d.value / max) * 100, 10) : 4;
        return (
          <div key={d.key} className="flex-1 min-w-0 h-full flex flex-col items-center justify-end gap-2 group relative">
            {/* Tooltip popup */}
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none absolute -top-8 px-2 py-1 bg-slate-900 text-white text-[10px] font-semibold rounded-md shadow-md z-10 whitespace-nowrap -translate-y-1 group-hover:translate-y-0">
              {d.value} {d.value === 1 ? 'post' : 'posts'}
            </div>
            
            {/* Bar */}
            <div
              className="w-full rounded-t-lg transition-all duration-200 group-hover:brightness-110 group-hover:scale-y-[1.02] origin-bottom cursor-pointer"
              style={{
                height: `${heightPct}%`,
                background: d.value
                  ? `linear-gradient(180deg, ${color}, #8b5cf6)`
                  : '#f1f5f9',
                boxShadow: d.value ? '0 2px 8px -2px rgba(99, 102, 241, 0.3)' : undefined,
              }}
            />
            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-700 transition-colors">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

