import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Link2, Users, Instagram, Linkedin, Youtube } from 'lucide-react';
import { useConnections, usePlatforms, usePosts } from '@/api/services/socialDeck';
import DonutChart from '@/components/charts/DonutChart';
import MiniBarChart from '@/components/charts/MiniBarChart';
import HorizontalBarList from '@/components/charts/HorizontalBarList';

/** Platform id (from constants.js's CONNECTION_TYPES) -> the platform's dedicated page route. */
const PLATFORM_ROUTE: Record<string, string> = {
  ttf_community: '/community',
  linkedin: '/linkedin',
  youtube: '/youtube',
  instagram: '/instagram',
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

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="sd-display text-2xl font-bold">Social Deck</h1>
        <p className="text-xs text-[var(--sd-muted)] mt-1">
          Connect and authorize each platform before publishing (Community today; LinkedIn & Instagram soon).
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Activity</h2>
        <div className="space-y-3">
          <div className="rounded-xl border border-[var(--sd-line)] bg-white p-4">
            <p className="text-xs font-medium text-gray-600 mb-3">Posts — last 14 days</p>
            {posts.length === 0 ? (
              <p className="text-xs text-gray-400">No posts yet.</p>
            ) : (
              <MiniBarChart data={postsByDay} />
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--sd-line)] bg-white p-4">
              <p className="text-xs font-medium text-gray-600 mb-3">Status breakdown</p>
              <DonutChart segments={statusBreakdown} />
            </div>
            <div className="rounded-xl border border-[var(--sd-line)] bg-white p-4">
              <p className="text-xs font-medium text-gray-600 mb-3">Publishes by platform</p>
              <HorizontalBarList
                data={platformBreakdown}
                color={PLATFORM_BAR_COLOR}
                emptyLabel="No published posts yet."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--sd-line)] bg-white p-4">
          <p className="text-xs text-[var(--sd-muted)]">Connected</p>
          <p className="text-2xl font-bold text-purple-700">{connected.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--sd-line)] bg-white p-4">
          <p className="text-xs text-[var(--sd-muted)]">Total posts</p>
          <p className="text-2xl font-bold">{posts.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--sd-line)] bg-white p-4">
          <p className="text-xs text-[var(--sd-muted)]">Published</p>
          <p className="text-2xl font-bold text-emerald-600">
            {posts.filter((p) => p.status === 'published' || p.status === 'partial').length}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Platforms</h2>
        <div className="grid sm:grid-cols-2 gap-3">
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
                className={`rounded-xl border p-4 flex gap-3 transition-colors ${
                  isSoon
                    ? 'border-gray-200 bg-gray-50 opacity-80 cursor-default'
                    : 'border-[var(--sd-line)] bg-white hover:border-purple-300'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{p.name}</p>
                    {isSoon ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Coming soon
                      </span>
                    ) : isConnected ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Connected
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-[var(--sd-muted)] mt-0.5">{p.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
