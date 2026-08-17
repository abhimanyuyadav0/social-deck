import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PenSquare, Link2, Users, Instagram, Linkedin, Bot } from 'lucide-react';
import { useConnections, usePlatforms, usePosts } from '@/api/services/socialDeck';
import DonutChart from '@/components/charts/DonutChart';
import MiniBarChart from '@/components/charts/MiniBarChart';
import HorizontalBarList from '@/components/charts/HorizontalBarList';

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

      <div className="grid sm:grid-cols-3 gap-3">
        <Link
          to="/compose"
          className="rounded-xl border border-purple-200 bg-purple-50 p-4 hover:bg-purple-100 transition-colors"
        >
          <PenSquare className="w-5 h-5 text-purple-600 mb-2" />
          <p className="font-semibold text-sm">Compose post</p>
          <p className="text-xs text-[var(--sd-muted)] mt-1">Write once, publish everywhere</p>
        </Link>
        <Link
          to="/connections"
          className="rounded-xl border border-[var(--sd-line)] bg-white p-4 hover:border-purple-200 transition-colors"
        >
          <Link2 className="w-5 h-5 text-purple-600 mb-2" />
          <p className="font-semibold text-sm">Connections</p>
          <p className="text-xs text-[var(--sd-muted)] mt-1">Community & AI</p>
        </Link>
        <Link
          to="/auto"
          className="rounded-xl border border-[var(--sd-line)] bg-white p-4 hover:border-purple-200 transition-colors"
        >
          <Bot className="w-5 h-5 text-purple-600 mb-2" />
          <p className="font-semibold text-sm">Auto Run</p>
          <p className="text-xs text-[var(--sd-muted)] mt-1">Generate & post on a schedule</p>
        </Link>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Platforms</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {platforms.map((p) => {
            const Icon = iconFor(p.id);
            const isSoon = p.status === 'coming_soon';
            return (
              <div
                key={p.id}
                className={`rounded-xl border p-4 flex gap-3 ${
                  isSoon ? 'border-gray-200 bg-gray-50 opacity-80' : 'border-[var(--sd-line)] bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{p.name}</p>
                    {isSoon && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--sd-muted)] mt-0.5">{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
