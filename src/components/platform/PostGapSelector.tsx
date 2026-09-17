export interface PostGapOption {
  minutes: number;
  hours: number;
  label: string;
  category: 'minutes' | 'hours' | 'days';
}

export const POST_GAP_OPTIONS: PostGapOption[] = [
  { minutes: 1, hours: 1 / 60, label: 'Every 1 min', category: 'minutes' },
  { minutes: 5, hours: 5 / 60, label: 'Every 5 min', category: 'minutes' },
  { minutes: 10, hours: 10 / 60, label: 'Every 10 min', category: 'minutes' },
  { minutes: 15, hours: 15 / 60, label: 'Every 15 min', category: 'minutes' },
  { minutes: 30, hours: 30 / 60, label: 'Every 30 min', category: 'minutes' },
  { minutes: 60, hours: 1, label: 'Every 1 hr', category: 'hours' },
  { minutes: 120, hours: 2, label: 'Every 2 hr', category: 'hours' },
  { minutes: 240, hours: 4, label: 'Every 4 hours', category: 'hours' },
  { minutes: 480, hours: 8, label: 'Every 8 hours', category: 'hours' },
  { minutes: 960, hours: 16, label: 'Every 16 hours', category: 'hours' },
  { minutes: 1440, hours: 24, label: 'Every day (24 hours)', category: 'days' },
  { minutes: 4320, hours: 72, label: 'Every 3 days', category: 'days' },
  { minutes: 8640, hours: 144, label: 'Every 6 days', category: 'days' },
  { minutes: 14400, hours: 240, label: 'Every 10 days', category: 'days' },
];

export function formatPostGap(
  value: number,
  unit: 'minutes' | 'hours' = 'minutes',
): string {
  if (value === undefined || value === null) return '—';
  const targetMinutes = unit === 'hours' ? Math.round(value * 60) : Math.round(value);
  const matched = POST_GAP_OPTIONS.find((opt) => opt.minutes === targetMinutes);
  if (matched) return matched.label;

  // Fallbacks for custom / legacy values
  if (targetMinutes < 60) return `Every ${targetMinutes} min`;
  const hours = targetMinutes / 60;
  if (hours < 24) {
    return hours === 1 ? 'Every 1 hr' : `Every ${hours} hours`;
  }
  const days = hours / 24;
  return days === 1 ? 'Every day (24 hours)' : `Every ${days} days`;
}

export interface PostGapSelectorProps {
  value: number;
  onChange: (value: number) => void;
  unit?: 'minutes' | 'hours';
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  showCategoryBadges?: boolean;
}

export default function PostGapSelector({
  value,
  onChange,
  unit = 'minutes',
  disabled = false,
  compact = false,
  className = '',
  showCategoryBadges = true,
}: PostGapSelectorProps) {
  const isSelected = (opt: PostGapOption) => {
    if (unit === 'hours') {
      return (
        Math.abs(opt.hours - value) < 0.001 ||
        opt.minutes === Math.round(value * 60)
      );
    }
    return opt.minutes === Math.round(value);
  };

  const categories = [
    { key: 'minutes', label: 'Minutes', items: POST_GAP_OPTIONS.filter((o) => o.category === 'minutes') },
    { key: 'hours', label: 'Hours', items: POST_GAP_OPTIONS.filter((o) => o.category === 'hours') },
    { key: 'days', label: 'Days', items: POST_GAP_OPTIONS.filter((o) => o.category === 'days') },
  ] as const;

  return (
    <div className={`space-y-2.5 ${className}`}>
      {categories.map((cat) => (
        <div key={cat.key} className="space-y-1.5">
          {showCategoryBadges && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {cat.label}
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {cat.items.map((opt) => {
              const active = isSelected(opt);
              return (
                <button
                  key={opt.minutes}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(unit === 'hours' ? opt.hours : opt.minutes)}
                  className={`rounded-lg font-medium border transition-all duration-150 disabled:opacity-50 ${
                    compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
                  } ${
                    active
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-700'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
