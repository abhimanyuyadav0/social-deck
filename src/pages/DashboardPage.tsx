import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Link2,
  Users,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Share2,
  CheckCircle2,
  Send,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { type SocialPost, useConnections, usePlatforms, usePosts } from '@/api/services/socialDeck';
import DonutChart from '@/components/charts/DonutChart';
import MiniBarChart from '@/components/charts/MiniBarChart';
import HorizontalBarList from '@/components/charts/HorizontalBarList';
import AiAssistantCard from '@/components/AiAssistantCard';
import CrossPostModal from '@/components/platform/CrossPostModal';

const PLATFORM_ROUTE: Record<string, string> = {
  ttf_community: '/community',
  linkedin: '/linkedin',
  youtube: '/youtube',
  instagram: '/instagram',
  facebook: '/facebook',
};

const PLATFORM_BRAND: Record<
  string,
  { bg: string; text: string; border: string; accent: string }
> = {
  linkedin: { bg: 'bg-sky-50', text: 'text-[#0a66c2]', border: 'border-sky-200', accent: '#0a66c2' },
  instagram: { bg: 'bg-pink-50', text: 'text-[#e1306c]', border: 'border-pink-200', accent: '#e1306c' },
  facebook: { bg: 'bg-blue-50', text: 'text-[#1877f2]', border: 'border-blue-200', accent: '#1877f2' },
  youtube: { bg: 'bg-red-50', text: 'text-[#ef4444]', border: 'border-red-200', accent: '#ef4444' },
  ttf_community: { bg: 'bg-purple-50', text: 'text-[#8b5cf6]', border: 'border-purple-200', accent: '#8b5cf6' },
};

const STATUS_COLORS: Record<string, string> = {
  published: '#10b981',
  partial: '#f59e0b',
  failed: '#ef4444',
  publishing: '#3b82f6',
  draft: '#94a3b8',
};

const PLATFORM_BAR_COLOR = '#6366f1';

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
  const [crossPostTarget, setCrossPostTarget] = useState<SocialPost | null>(null);

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
  const successRate = posts.length > 0 ? Math.round((publishedCount / posts.length) * 100) : 100;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <span className="sd-pulse-dot bg-indigo-500" />
            <span>{currentDate}</span>
          </div>
          <h1 className="sd-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {getGreeting()}, welcome back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Autonomous multi-platform publishing dashboard and AI content workflow.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() =>
              setCrossPostTarget({
                id: '',
                title: '',
                content: '',
                images: [],
                videoUrl: null,
                category: 'General',
                tags: [],
                results: [],
                status: 'draft',
                createdAt: new Date().toISOString(),
                source: 'dashboard',
                targetConnectionIds: [],
              })
            }
            className="sd-btn sd-btn-primary px-3.5 py-2 text-xs shadow-xs inline-flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Cross-Post
          </button>
          <Link
            to="/ai-models"
            className="sd-btn sd-btn-secondary px-3.5 py-2 text-xs shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            AI Routing
          </Link>
          <Link
            to="/instagram"
            className="sd-btn sd-btn-secondary px-3.5 py-2 text-xs shadow-xs"
          >
            Manage Channels
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <CrossPostModal
        post={crossPostTarget}
        onClose={() => setCrossPostTarget(null)}
      />

      {/* Modern KPI Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Stat 1 */}
        <div className="sd-card sd-card-hover p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Connected Channels</span>
            <div className="sd-icon-badge w-10 h-10 bg-indigo-50 text-indigo-600">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-slate-900 leading-none">{connected.length}</p>
              <span className="text-xs font-semibold text-slate-400">of {platforms.length} platforms</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="sd-badge bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">
                {connected.length > 0 ? 'Sync active' : 'None linked'}
              </span>
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="sd-card sd-card-hover p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Posts Created</span>
            <div className="sd-icon-badge w-10 h-10 bg-blue-50 text-blue-600">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-slate-900 leading-none">{posts.length}</p>
              <span className="text-xs font-semibold text-slate-400">across channels</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Multi-channel distribution</span>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="sd-card sd-card-hover p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Delivery Rate</span>
            <div className="sd-icon-badge w-10 h-10 bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-slate-900 leading-none">{successRate}%</p>
              <span className="text-xs font-semibold text-slate-400">({publishedCount} published)</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="sd-badge bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                High reliability
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Command Center Card */}
      <AiAssistantCard />

      {/* Activity & Performance Visuals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Publishing Activity & Telemetry
          </h2>
          <span className="text-xs text-slate-400">Live Updates</span>
        </div>

        <div className="sd-card sd-card-hover p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Post Volume Frequency
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Posts created over the last 14 days</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              14 Days
            </span>
          </div>
          {posts.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-xs text-slate-400">No posts published yet. Connect a channel to begin.</p>
            </div>
          ) : (
            <MiniBarChart data={postsByDay} />
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sd-card sd-card-hover p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Status Breakdown
            </p>
            <p className="text-xs text-slate-500 mb-5">Current state of queued & published posts</p>
            <DonutChart segments={statusBreakdown} />
          </div>

          <div className="sd-card sd-card-hover p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Publishes by Platform
            </p>
            <p className="text-xs text-slate-500 mb-5">Successful delivery distribution</p>
            <HorizontalBarList
              data={platformBreakdown}
              color={PLATFORM_BAR_COLOR}
              emptyLabel="No published platform posts yet."
            />
          </div>
        </div>
      </div>

      {/* Platform Channels Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Social Channels</h2>
          <span className="text-xs text-slate-400">5 Available Platforms</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((p) => {
            const Icon = iconFor(p.id);
            const isSoon = p.status === 'coming_soon';
            const isConnected = connected.some(
              (c) => c.type === p.id || (p.id === 'ttf_community' && c.type === 'ttf_community'),
            );
            const route = PLATFORM_ROUTE[p.id];
            const brand = PLATFORM_BRAND[p.id] || {
              bg: 'bg-slate-50',
              text: 'text-indigo-600',
              border: 'border-slate-200',
              accent: '#6366f1',
            };

            return (
              <Link
                key={p.id}
                to={isSoon || !route ? '#' : route}
                onClick={(e) => {
                  if (isSoon || !route) e.preventDefault();
                }}
                className={`sd-card p-5 flex flex-col justify-between gap-3 group ${
                  isSoon
                    ? 'opacity-65 cursor-default'
                    : 'sd-card-link cursor-pointer hover:border-indigo-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`sd-icon-badge w-11 h-11 ${brand.bg} ${brand.text} shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSoon ? (
                      <span className="sd-badge bg-amber-50 text-amber-700 border-amber-200">
                        Coming soon
                      </span>
                    ) : isConnected ? (
                      <span className="sd-badge bg-emerald-50 text-emerald-700 border-emerald-200">
                        <span className="sd-pulse-dot bg-emerald-500" />
                        Connected
                      </span>
                    ) : (
                      <span className="sd-badge bg-slate-100 text-slate-600">Not linked</span>
                    )}
                  </div>
                  <p className="font-bold text-sm text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {p.description}
                  </p>
                </div>

                {!isSoon && (
                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-indigo-600 border-t border-slate-100 mt-1">
                    <span>{isConnected ? 'Open channel hub' : 'Connect now'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

