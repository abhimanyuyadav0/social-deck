type Segment = { label: string; value: number; color: string };

/** r = 15.9155 makes the circle's circumference ≈100, so stroke-dasharray can use plain percentages. */
const RADIUS = 15.9155;
const CIRCUMFERENCE = 100;

export default function DonutChart({
  segments,
  size = 120,
  thickness = 14,
  centerLabel = 'posts',
}: {
  segments: Segment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  let cumulative = 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
          <circle
            cx="21"
            cy="21"
            r={RADIUS}
            fill="transparent"
            stroke="var(--sd-line, #e5e7eb)"
            strokeWidth={thickness}
          />
          {total > 0 &&
            segments
              .filter((s) => s.value > 0)
              .map((s) => {
                const pct = (s.value / total) * CIRCUMFERENCE;
                const offset = -cumulative;
                cumulative += pct;
                return (
                  <circle
                    key={s.label}
                    cx="21"
                    cy="21"
                    r={RADIUS}
                    fill="transparent"
                    stroke={s.color}
                    strokeWidth={thickness}
                    strokeDasharray={`${pct} ${CIRCUMFERENCE - pct}`}
                    strokeDashoffset={offset}
                  >
                    <title>{`${s.label}: ${s.value}`}</title>
                  </circle>
                );
              })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{total}</span>
          {total > 0 && <span className="text-[10px] text-gray-400">{centerLabel}</span>}
        </div>
      </div>
      <ul className="space-y-1.5 text-xs min-w-0">
        {total === 0 ? (
          <li className="text-gray-400">No posts yet</li>
        ) : (
          segments
            .filter((s) => s.value > 0)
            .map((s) => (
              <li key={s.label} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="capitalize text-gray-600 truncate">{s.label}</span>
                <span className="font-semibold text-gray-900 ml-auto pl-2">{s.value}</span>
              </li>
            ))
        )}
      </ul>
    </div>
  );
}
