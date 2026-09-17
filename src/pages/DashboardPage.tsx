import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Link2, Users, Instagram, Facebook, Linkedin, Youtube, Share2, CheckCircle2, Send } from 'lucide-react';
import { useConnections, usePlatforms, usePosts } from '@/api/services/socialDeck';
import DonutChart from '@/components/charts/DonutChart';
import MiniBarChart from '@/components/charts/MiniBarChart';
import HorizontalBarList from '@/components/charts/HorizontalBarList';
import AiAssistantCard from '@/components/AiAssistantCard';

/** Platform id (from constants.js's CONNECTION_TYPES) -> the platform's dedicated page route. */
const PLATFORM_ROUTE: Record<string, string> = {
  ttf_community: '/community',
  linkedin: '/linkedin',
  youtube: '/youtube',
  instagram: '/instagram',
  facebook: '/facebook',
};

const STATUS_COLORS: Record<string, string> = {
  published: '#059669',
  partial: '#d97706',
  failed: '#dc2626',
  publishing: '#2563eb',
  draft: '#9ca3af',
};

const PLATFORM_BAR_COLOR = '#7c3aed';

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatPlatformLabel(type: string) {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DashboardPage() {
  const { data: platformsData } = usePlatforms();
  const { data: connectionsData } = useConnections();
  const { data: postsData } = usePosts();

  const platforms = platformsData?.data?.platforms ?? [];
  const connections = connectionsData?.data?.connections ?? [];
  const posts = postsData?.data?.posts ?? [];
  const connected = connections.filter((c) => c.status === 'connected');

  const iconFor = (id: string) => {
    if (id.includes('community')) return Users;
    if (id.includes('linkedin')) return Linkedin;
    if (id.includes('instagram')) return Instagram;
    if (id.includes('facebook')) return Facebook;
    if (id.includes('youtube')) return Youtube;
    return Link2;
  };

  const postsByDay = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of posts) {
      const d = new Date(p.createdAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = dayKey(d);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const days = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push({ key: dayKey(d), label: String(d.getDate()), value: counts.get(dayKey(d)) || 0 });
    }
    return days;
  }, [posts]);

  const statusBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of posts) counts.set(p.status, (counts.get(p.status) || 0) + 1);
    return Object.entries(STATUS_COLORS).map(([status, color]) => ({
      label: status,
      value: counts.get(status) || 0,
      color,
    }));
  }, [posts]);

  const platformBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of posts) {
      for (const r of p.results || []) {
        if (r.status !== 'published') continue;
        const key = r.connectionType || r.connectionName || 'other';
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([type, value]) => ({ label: formatPlatformLabel(type), value }))
      .sort((a, b) => b.value - a.value);
  }, [posts]);

  const publishedCount = posts.filter((p) => p.status === 'published' || p.status === 'partial').length;

  const stats = [
    { label: 'Connected platforms', value: connected.length, icon: Share2, tint: 'purple' as const },
    { label: 'Total posts', value: posts.length, icon: Send, tint: 'blue' as const },
    { label: 'Published', value: publishedCount, icon: CheckCircle2, tint: 'emerald' as const },
  ];

  const tintClasses: Record<'purple' | 'blue' | 'emerald', string> = {
    purple: 'bg-purple-50 text-purple-700',
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="sd-display text-[26px] font-bold tracking-tight text-[var(--sd-ink)]">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--sd-muted)] mt-1">
          Pick a platform in the sidebar to connect it and manage its posts.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="sd-card sd-card-hover p-5 flex items-center gap-4">
            <div className={`sd-icon-badge w-11 h-11 ${tintClasses[s.tint]}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-[var(--sd-ink)] leading-none">{s.value}</p>
              <p className="text-xs text-[var(--sd-muted)] mt-1.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <AiAssistantCard />

      <div>
        <h2 className="text-[15px] font-bold text-[var(--sd-ink)] mb-3.5">Activity</h2>
        <div className="space-y-4">
          <div className="sd-card sd-card-hover p-5">
            <p className="text-xs font-semibold text-[var(--sd-muted)] mb-4">Posts — last 14 days</p>
            {posts.length === 0 ? (
              <p className="text-xs text-[var(--sd-subtle)]">No posts yet.</p>
            ) : (
              <MiniBarChart data={postsByDay} />
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sd-card sd-card-hover p-5">
              <p className="text-xs font-semibold text-[var(--sd-muted)] mb-4">Status breakdown</p>
              <DonutChart segments={statusBreakdown} />
            </div>
            <div className="sd-card sd-card-hover p-5">
              <p className="text-xs font-semibold text-[var(--sd-muted)] mb-4">Publishes by platform</p>
              <HorizontalBarList
                data={platformBreakdown}
                color={PLATFORM_BAR_COLOR}
                emptyLabel="No published posts yet."
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[15px] font-bold text-[var(--sd-ink)] mb-3.5">Platforms</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {platforms.map((p) => {
            const Icon = iconFor(p.id);
            const isSoon = p.status === 'coming_soon';
            const isConnected = connected.some(
              (c) => c.type === p.id || (p.id === 'ttf_community' && c.type === 'ttf_community'),
            );
            const route = PLATFORM_ROUTE[p.id];
            return (
              <Link
                key={p.id}
                to={isSoon || !route ? '#' : route}
                onClick={(e) => {
                  if (isSoon || !route) e.preventDefault();
                }}
                className={`sd-card flex p-4 gap-3.5 ${
                  isSoon
                    ? 'opacity-70 cursor-default grayscale-[0.3]'
                    : 'sd-card-link cursor-pointer'
                }`}
              >
                <div className="sd-icon-badge w-11 h-11 bg-purple-50 text-purple-700 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-[var(--sd-ink)]">{p.name}</p>
                    {isSoon ? (
                      <span className="sd-badge bg-amber-100 text-amber-800">Coming soon</span>
                    ) : isConnected ? (
                      <span className="sd-badge bg-emerald-100 text-emerald-800">Connected</span>
                    ) : null}
                  </div>
                  <p className="text-xs text-[var(--sd-muted)] mt-1 leading-relaxed">{p.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
