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
          <span className="text-xl font-bold text-[var(--sd-ink)]">{total}</span>
          {total > 0 && <span className="text-[10px] text-[var(--sd-subtle)]">{centerLabel}</span>}
        </div>
      </div>
      <ul className="space-y-2 text-xs min-w-0">
        {total === 0 ? (
          <li className="text-[var(--sd-subtle)]">No posts yet</li>
        ) : (
          segments
            .filter((s) => s.value > 0)
            .map((s) => (
              <li key={s.label} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.color, boxShadow: `0 0 0 3px ${s.color}1a` }}
                />
                <span className="capitalize text-[var(--sd-muted)] truncate">{s.label}</span>
                <span className="font-semibold text-[var(--sd-ink)] ml-auto pl-2">{s.value}</span>
              </li>
            ))
        )}
      </ul>
    </div>
  );
}
