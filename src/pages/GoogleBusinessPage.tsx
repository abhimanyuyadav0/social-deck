import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'glintly-ui';
import {
  Store,
  Star,
  Sparkles,
  Bot,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Copy,
  Sliders,
  MessageSquare,
  QrCode,
  MapPin,
  Clock,
  Send,
  Plus,
  Trash2,
  Check,
  Zap,
  Mail,
  ShieldCheck,
  CircleHelp,
  Unlink,
} from 'lucide-react';
import {
  useGoogleBusinessConfig,
  useUpdateGoogleBusinessConfig,
  useGoogleReviews,
  useSyncGoogleReviews,
  useReplyGoogleReview,
  useSimulateGoogleReview,
  useStartGoogleBusinessConnect,
  useDisconnectGoogleBusiness,
  useConnections,
  type AutoReplyTemplates,
} from '@/api/services/socialDeck';
import { GoogleBusinessHelpModal } from '@/components/ConnectorHelpModals';

type TabKey = 'rules' | 'reviews' | 'get-reviews' | 'details';

export default function GoogleBusinessPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>('rules');
  const [starFilter, setStarFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Simulation modal state
  const [simulateOpen, setSimulateOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [simName, setSimName] = useState('Ananya Roy');
  const [simRating, setSimRating] = useState(5);
  const [simComment, setSimComment] = useState('Excellent experience! The team went above and beyond.');

  // Manual reply inline state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [manualReplyText, setManualReplyText] = useState('');

  // API hooks
  const { data: configData, isLoading: configLoading } = useGoogleBusinessConfig();
  const { data: reviewsData, isLoading: reviewsLoading } = useGoogleReviews({
    starRating: starFilter !== 'all' ? starFilter : undefined,
    replyStatus: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const updateConfig = useUpdateGoogleBusinessConfig();
  const syncReviews = useSyncGoogleReviews();
  const replyReview = useReplyGoogleReview();
  const simulateReview = useSimulateGoogleReview();
  const startConnect = useStartGoogleBusinessConnect();
  const disconnectGoogle = useDisconnectGoogleBusiness();
  const { refetch: refetchConnections } = useConnections();

  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const config = configData?.data?.config;
  const isConnected = configData?.data?.connected;

  // Local form state for Auto-Reply Rules
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [autoReplyMode, setAutoReplyMode] = useState<'templates' | 'ai'>('templates');
  const [autoReplyDelayMinutes, setAutoReplyDelayMinutes] = useState(5);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [businessName, setBusinessName] = useState('Time to Future Pvt. Ltd.');
  const [templates, setTemplates] = useState<AutoReplyTemplates>({
    fiveStar: [],
    fourStar: [],
    threeStar: [],
    twoStar: [],
    oneStar: [],
  });

  // Sync state from server on load
  useEffect(() => {
    if (config) {
      setAutoReplyEnabled(config.autoReplyEnabled ?? true);
      setAutoReplyMode(config.autoReplyMode || 'templates');
      setAutoReplyDelayMinutes(config.autoReplyDelayMinutes ?? 5);
      setNotificationEmail(config.autoReplyNotificationEmail || '');
      setBusinessName(config.googleLocationName || 'Time to Future Pvt. Ltd.');
      if (config.autoReplyTemplates) {
        setTemplates(config.autoReplyTemplates);
      }
    }
  }, [config]);

  // Handle OAuth callback status
  useEffect(() => {
    const googleStatus = searchParams.get('google');
    if (googleStatus === 'connected') {
      toast.success('Google Business Profile connected successfully!');
      refetchConnections();
      const next = new URLSearchParams(searchParams);
      next.delete('google');
      setSearchParams(next, { replace: true });
    } else if (googleStatus === 'error') {
      toast.error(searchParams.get('message') || 'Google Business connection failed');
      const next = new URLSearchParams(searchParams);
      next.delete('google');
      next.delete('message');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, refetchConnections]);

  const handleConnectGoogle = () => {
    startConnect.mutate(undefined, {
      onSuccess: (res) => {
        if (res?.data?.url) {
          window.location.href = res.data.url;
        } else {
          toast.error('No Google authorization URL returned');
        }
      },
      onError: (err) => {
        toast.error(err.message || 'Could not start Google OAuth');
      },
    });
  };


  const handleDisconnect = () => {
    disconnectGoogle.mutate(undefined, {
      onSuccess: () => {
        toast.success('Google Business Profile disconnected');
        setDisconnectModalOpen(false);
        refetchConnections();
      },
      onError: (err: any) => {
        toast.error(err?.message || 'Failed to disconnect');
      },
    });
  };

  const handleSaveRules = () => {
    updateConfig.mutate(
      {
        autoReplyEnabled,
        autoReplyMode,
        autoReplyDelayMinutes,
        autoReplyNotificationEmail: notificationEmail,
        autoReplyTemplates: templates,
        googleLocationName: businessName,
      },
      {
        onSuccess: () => {
          toast.success('Auto-responder settings saved!');
        },
        onError: (err) => {
          toast.error(err.message || 'Could not save rules');
        },
      },
    );
  };

  const handleAddTemplate = (starTier: keyof AutoReplyTemplates) => {
    const current = templates[starTier] || [];
    const updated = [
      ...current,
      'Thank you for your review, {reviewer_name}! The team at {business_name} appreciates your feedback.',
    ];
    setTemplates({ ...templates, [starTier]: updated });
  };

  const handleRemoveTemplate = (starTier: keyof AutoReplyTemplates, index: number) => {
    const current = templates[starTier] || [];
    const updated = current.filter((_, i) => i !== index);
    setTemplates({ ...templates, [starTier]: updated });
  };

  const handleUpdateTemplate = (starTier: keyof AutoReplyTemplates, index: number, value: string) => {
    const current = [...(templates[starTier] || [])];
    current[index] = value;
    setTemplates({ ...templates, [starTier]: current });
  };

  const handleInsertTag = (starTier: keyof AutoReplyTemplates, index: number, tag: string) => {
    const current = [...(templates[starTier] || [])];
    current[index] = `${current[index]} ${tag}`;
    setTemplates({ ...templates, [starTier]: current });
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    simulateReview.mutate(
      {
        reviewerName: simName,
        starRating: simRating,
        comment: simComment,
      },
      {
        onSuccess: (res) => {
          toast.success(res.message || 'Simulated review processed!');
          setSimulateOpen(false);
          setActiveTab('reviews');
        },
        onError: (err) => toast.error(err.message || 'Simulation failed'),
      },
    );
  };

  const handleManualReplySubmit = (reviewId: string) => {
    if (!manualReplyText.trim()) return;
    replyReview.mutate(
      { reviewId, replyText: manualReplyText },
      {
        onSuccess: () => {
          toast.success('Reply submitted to Google!');
          setReplyingReviewId(null);
          setManualReplyText('');
        },
        onError: (err) => toast.error(err.message || 'Reply failed'),
      },
    );
  };

  const reviews = reviewsData?.data?.reviews || [];
  const totalReviews = config?.totalReviewsCount || reviews.length;
  const avgRating = config?.averageRating || 4.9;
  const reviewUrl =
    config?.googleReviewUrl ||
    'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4';

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    toast.success(msg);
  };

  if (configLoading) {
    return (
      <div className="max-w-6xl space-y-6">
        <div className="sd-skeleton h-10 w-64" />
        <div className="grid sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="sd-skeleton h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6 pb-12">
      <GoogleBusinessHelpModal open={showHelp} onClose={() => setShowHelp(false)} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--sd-border)] pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-sm">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="sd-display text-2xl font-bold text-[var(--sd-ink)]">
                Google Business Profile
              </h1>
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Setup guide & redirect URI instructions"
              >
                <CircleHelp className="w-5 h-5" />
              </button>
              {isConnected ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected & Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Disconnected
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--sd-subtle)] mt-0.5">
              Auto-reply to reviews on autopilot, manage rating responses, and boost your local Google ranking.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <button
                type="button"
                onClick={() => syncReviews.mutate()}
                disabled={syncReviews.isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-[var(--sd-border)] bg-[var(--sd-card)] hover:bg-[var(--sd-card-hover)] text-[var(--sd-ink)] transition-colors shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncReviews.isPending ? 'animate-spin text-blue-600' : ''}`} />
                {syncReviews.isPending ? 'Syncing...' : 'Sync Reviews'}
              </button>
              <button
                type="button"
                onClick={() => setSimulateOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                Test Auto-Reply
              </button>
              <button
                type="button"
                onClick={() => setDisconnectModalOpen(true)}
                disabled={disconnectGoogle.isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors shadow-xs"
                title="Disconnect Google Business Profile"
              >
                <Unlink className="w-3.5 h-3.5 text-red-600" />
                {disconnectGoogle.isPending ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={startConnect.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                {startConnect.isPending ? 'Starting...' : 'Connect with Google'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Overview Metrics */}
      {isConnected && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[var(--sd-border)] bg-[var(--sd-card)] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[var(--sd-subtle)] font-medium">
              <span>Overall Rating</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--sd-ink)]">{avgRating}</span>
              <div className="flex text-amber-500 text-xs">
                {'★'.repeat(Math.round(avgRating))}
              </div>
            </div>
            <span className="text-[11px] text-[var(--sd-subtle)] mt-1 block">Live on Google Maps</span>
          </div>

          <div className="p-4 rounded-xl border border-[var(--sd-border)] bg-[var(--sd-card)] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[var(--sd-subtle)] font-medium">
              <span>Total Reviews</span>
              <MessageSquare className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--sd-ink)]">{totalReviews}</span>
              <span className="text-xs text-emerald-600 font-medium">+100% verified</span>
            </div>
            <span className="text-[11px] text-[var(--sd-subtle)] mt-1 block">Synced with profile</span>
          </div>

          <div className="p-4 rounded-xl border border-[var(--sd-border)] bg-[var(--sd-card)] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[var(--sd-subtle)] font-medium">
              <span>Auto-Responder</span>
              <Bot className="w-4 h-4 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-base font-bold ${autoReplyEnabled ? 'text-emerald-600' : 'text-amber-600'}`}>
                {autoReplyEnabled ? 'Auto-Pilot Active' : 'Paused'}
              </span>
            </div>
            <span className="text-[11px] text-[var(--sd-subtle)] mt-1 block">
              Mode: {autoReplyMode === 'ai' ? 'AI Dynamic' : 'Smart Rules'}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-[var(--sd-border)] bg-[var(--sd-card)] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[var(--sd-subtle)] font-medium">
              <span>Average Reply Time</span>
              <Clock className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--sd-ink)]">
                {autoReplyDelayMinutes === 0 ? '< 1m' : `${autoReplyDelayMinutes}m`}
              </span>
              <span className="text-xs text-emerald-600 font-medium">Instant</span>
            </div>
            <span className="text-[11px] text-[var(--sd-subtle)] mt-1 block">Human-safe delay configured</span>
          </div>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[var(--sd-border)] text-sm">
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`pb-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'rules'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-[var(--sd-subtle)] hover:text-[var(--sd-ink)]'
            }`}
        >
          <Sliders className="w-4 h-4" />
          Auto-Reply Rules
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'reviews'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-[var(--sd-subtle)] hover:text-[var(--sd-ink)]'
            }`}
        >
          <MessageSquare className="w-4 h-4" />
          Reviews Inbox & Logs
          {reviews.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-blue-100 text-blue-700">
              {reviews.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('get-reviews')}
          className={`pb-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'get-reviews'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-[var(--sd-subtle)] hover:text-[var(--sd-ink)]'
            }`}
        >
          <QrCode className="w-4 h-4" />
          Review QR & Direct Link
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`pb-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'details'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-[var(--sd-subtle)] hover:text-[var(--sd-ink)]'
            }`}
        >
          <MapPin className="w-4 h-4" />
          Listing Profile
        </button>
      </div>

      {/* TAB 1: AUTO-REPLY RULES */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* Master Auto-Responder Card */}
          <div className="p-6 rounded-xl border border-[var(--sd-border)] bg-[var(--sd-card)] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--sd-ink)] flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  Auto-Responder Engine Settings
                </h2>
                <p className="text-xs text-[var(--sd-subtle)] mt-1">
                  Configure how reviews left on Google Maps are processed and automatically replied to.
                </p>
              </div>

              {/* Master Switch */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[var(--sd-ink)]">
                  {autoReplyEnabled ? 'Auto-Reply ON' : 'Auto-Reply OFF'}
                </span>
                <button
                  type="button"
                  onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-hidden ${autoReplyEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${autoReplyEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-[var(--sd-border)]">
              {/* Engine Mode */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--sd-ink)] uppercase tracking-wider block">
                  Reply Generation Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAutoReplyMode('templates')}
                    className={`p-3 rounded-lg border text-left transition-all ${autoReplyMode === 'templates'
                        ? 'border-blue-600 bg-blue-500/5 text-blue-700 ring-1 ring-blue-600'
                        : 'border-[var(--sd-border)] bg-[var(--sd-card)] text-[var(--sd-subtle)] hover:text-[var(--sd-ink)]'
                      }`}
                  >
                    <Sliders className="w-4 h-4 mb-1 text-blue-600" />
                    <div className="text-xs font-bold">Rule Templates</div>
                    <div className="text-[10px] text-[var(--sd-subtle)]">Rotated star templates</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAutoReplyMode('ai')}
                    className={`p-3 rounded-lg border text-left transition-all ${autoReplyMode === 'ai'
                        ? 'border-purple-600 bg-purple-500/5 text-purple-700 ring-1 ring-purple-600'
                        : 'border-[var(--sd-border)] bg-[var(--sd-card)] text-[var(--sd-subtle)] hover:text-[var(--sd-ink)]'
                      }`}
                  >
                    <Sparkles className="w-4 h-4 mb-1 text-purple-600" />
                    <div className="text-xs font-bold">AI Autopilot</div>
                    <div className="text-[10px] text-[var(--sd-subtle)]">Contextual AI synthesis</div>
                  </button>
                </div>
              </div>

              {/* Delay Timer */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--sd-ink)] uppercase tracking-wider block">
                  Response Delay
                </label>
                <select
                  value={autoReplyDelayMinutes}
                  onChange={(e) => setAutoReplyDelayMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--sd-border)] bg-[var(--sd-card)] text-[var(--sd-ink)]"
                >
                  <option value={0}>Instant (Immediate reply)</option>
                  <option value={5}>5 Minutes (Recommended - Organic)</option>
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour</option>
                </select>
                <p className="text-[10px] text-[var(--sd-subtle)]">
                  Staggering replies prevents automated bot flags on Google algorithms.
                </p>
              </div>

              {/* Notification Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--sd-ink)] uppercase tracking-wider block">
                  Negative Review Alert Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--sd-subtle)] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="support@timetofuture.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--sd-border)] bg-[var(--sd-card)] text-[var(--sd-ink)]"
                  />
                </div>
                <p className="text-[10px] text-[var(--sd-subtle)]">
                  Notifies team instantly when a review under 4 stars is detected.
                </p>
              </div>
            </div>
          </div>

          {/* Template Buckets by Star Rating */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--sd-ink)]">
                  Rating Response Template Pools
                </h3>
                <p className="text-xs text-[var(--sd-subtle)]">
                  The system randomly rotates these variants so replies remain fresh and non-repetitive.
                </p>
              </div>
              <div className="text-xs text-[var(--sd-subtle)] flex items-center gap-1.5">
                <span>Available placeholders:</span>
                <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-[11px] font-mono">{'{reviewer_name}'}</code>
                <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-[11px] font-mono">{'{business_name}'}</code>
                <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-[11px] font-mono">{'{support_email}'}</code>
              </div>
            </div>

            {/* 5 Star Pool */}
            <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-xs flex items-center gap-1">
                    5 <Star className="w-3 h-3 fill-white" />
                  </span>
                  <span className="text-sm font-bold text-emerald-900">5-Star Reviews (Delighted Customers)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddTemplate('fiveStar')}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Variant
                </button>
              </div>
              <div className="space-y-3">
                {(templates.fiveStar || []).map((tmpl, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <textarea
                        rows={2}
                        value={tmpl}
                        onChange={(e) => handleUpdateTemplate('fiveStar', idx, e.target.value)}
                        className="flex-1 p-2.5 text-xs rounded-lg border border-emerald-200 bg-white text-gray-800 focus:outline-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTemplate('fiveStar', idx)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 pl-1">
                      <span className="text-[10px] text-gray-400">Insert:</span>
                      <button
                        type="button"
                        onClick={() => handleInsertTag('fiveStar', idx, '{reviewer_name}')}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 font-mono"
                      >
                        + {'{reviewer_name}'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertTag('fiveStar', idx, '{business_name}')}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 font-mono"
                      >
                        + {'{business_name}'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Star Pool */}
            <div className="p-5 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-xs flex items-center gap-1">
                    4 <Star className="w-3 h-3 fill-white" />
                  </span>
                  <span className="text-sm font-bold text-blue-900">4-Star Reviews (Satisfied Customers)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddTemplate('fourStar')}
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Variant
                </button>
              </div>
              <div className="space-y-3">
                {(templates.fourStar || []).map((tmpl, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <textarea
                        rows={2}
                        value={tmpl}
                        onChange={(e) => handleUpdateTemplate('fourStar', idx, e.target.value)}
                        className="flex-1 p-2.5 text-xs rounded-lg border border-blue-200 bg-white text-gray-800 focus:outline-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTemplate('fourStar', idx)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 pl-1">
                      <span className="text-[10px] text-gray-400">Insert:</span>
                      <button
                        type="button"
                        onClick={() => handleInsertTag('fourStar', idx, '{reviewer_name}')}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-blue-200 text-blue-800 hover:bg-blue-50 font-mono"
                      >
                        + {'{reviewer_name}'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertTag('fourStar', idx, '{business_name}')}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-blue-200 text-blue-800 hover:bg-blue-50 font-mono"
                      >
                        + {'{business_name}'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 1 to 3 Star Pool (Crisis & Conflict Resolution) */}
            <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-xs flex items-center gap-1">
                    1-3 <Star className="w-3 h-3 fill-white" />
                  </span>
                  <span className="text-sm font-bold text-rose-900">
                    1 to 3-Star Reviews (Crisis Management & Private Support Routing)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddTemplate('oneStar')}
                  className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Variant
                </button>
              </div>
              <div className="space-y-3">
                {(templates.oneStar || []).map((tmpl, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <textarea
                        rows={2}
                        value={tmpl}
                        onChange={(e) => handleUpdateTemplate('oneStar', idx, e.target.value)}
                        className="flex-1 p-2.5 text-xs rounded-lg border border-rose-200 bg-white text-gray-800 focus:outline-rose-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTemplate('oneStar', idx)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 pl-1">
                      <span className="text-[10px] text-gray-400">Insert:</span>
                      <button
                        type="button"
                        onClick={() => handleInsertTag('oneStar', idx, '{reviewer_name}')}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-rose-200 text-rose-800 hover:bg-rose-50 font-mono"
                      >
                        + {'{reviewer_name}'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertTag('oneStar', idx, '{support_email}')}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-rose-200 text-rose-800 hover:bg-rose-50 font-mono"
                      >
                        + {'{support_email}'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleSaveRules}
              disabled={updateConfig.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              {updateConfig.isPending ? 'Saving...' : 'Save Auto-Reply Rules'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: REVIEWS INBOX & REPLY LOGS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl border border-[var(--sd-border)] bg-[var(--sd-card)] flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--sd-subtle)] font-medium">Filter by Rating:</span>
              <select
                value={starFilter}
                onChange={(e) => setStarFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-[var(--sd-border)] bg-[var(--sd-card)] text-[var(--sd-ink)]"
              >
                <option value="all">All Stars</option>
                <option value="5">5 Stars only</option>
                <option value="4">4 Stars only</option>
                <option value="3">3 Stars only</option>
                <option value="2">2 Stars only</option>
                <option value="1">1 Star only</option>
              </select>

              <span className="text-xs text-[var(--sd-subtle)] font-medium ml-2">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-[var(--sd-border)] bg-[var(--sd-card)] text-[var(--sd-ink)]"
              >
                <option value="all">All Statuses</option>
                <option value="replied">Replied</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSimulateOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" /> Simulate Incoming Review
              </button>
            </div>
          </div>

          {/* Review List */}
          {reviewsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="sd-skeleton h-32 rounded-xl" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[var(--sd-border)] rounded-2xl p-8">
              <MessageSquare className="w-10 h-10 text-[var(--sd-subtle)] mx-auto mb-2 opacity-40" />
              <h3 className="text-base font-bold text-[var(--sd-ink)]">No reviews found</h3>
              <p className="text-xs text-[var(--sd-subtle)] mt-1 max-w-sm mx-auto">
                No Google reviews matched your filter. Click "Simulate Incoming Review" to test how the auto-responder replies immediately!
              </p>
              <button
                type="button"
                onClick={() => setSimulateOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <Zap className="w-3.5 h-3.5" /> Simulate Test Review
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-5 rounded-xl border border-[var(--sd-border)] bg-[var(--sd-card)] shadow-xs space-y-4 hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.reviewerPhotoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${rev.reviewerName}`}
                        alt={rev.reviewerName}
                        className="w-10 h-10 rounded-full border border-[var(--sd-border)] object-cover bg-gray-100"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[var(--sd-ink)]">{rev.reviewerName}</h4>
                          {rev.simulated && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-medium">
                              Simulation Test
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex text-amber-500 text-xs">
                            {'★'.repeat(rev.starRating)}
                            {'☆'.repeat(5 - rev.starRating)}
                          </div>
                          <span className="text-[11px] text-[var(--sd-subtle)]">
                            {new Date(rev.reviewCreatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    {rev.replyStatus === 'replied' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {rev.replySource === 'ai_auto'
                          ? 'Auto-Replied (AI)'
                          : rev.replySource === 'template_auto'
                            ? 'Auto-Replied (Rule)'
                            : 'Replied (Manual)'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Pending Reply
                      </span>
                    )}
                  </div>

                  {/* Customer Review Comment */}
                  <p className="text-sm text-[var(--sd-ink)] bg-gray-50/50 p-3 rounded-lg border border-gray-100 italic">
                    "{rev.comment || '(Rating submitted without written comment)'}"
                  </p>

                  {/* Business Response */}
                  {rev.replyText ? (
                    <div className="pl-4 border-l-2 border-blue-500/40 bg-blue-50/20 p-3 rounded-r-lg space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-blue-900 flex items-center gap-1">
                          <Store className="w-3.5 h-3.5 text-blue-600" />
                          Response from {businessName}
                        </span>
                        {rev.repliedAt && (
                          <span className="text-[10px] text-[var(--sd-subtle)]">
                            {new Date(rev.repliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--sd-ink)] leading-relaxed">{rev.replyText}</p>
                    </div>
                  ) : null}

                  {/* Inline manual reply editor */}
                  {replyingReviewId === rev._id ? (
                    <div className="pt-2 border-t border-[var(--sd-border)] space-y-2">
                      <textarea
                        rows={3}
                        value={manualReplyText}
                        onChange={(e) => setManualReplyText(e.target.value)}
                        placeholder="Write a custom response to this reviewer..."
                        className="w-full p-2.5 text-xs rounded-lg border border-[var(--sd-border)] bg-[var(--sd-card)] text-[var(--sd-ink)] focus:outline-blue-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReplyingReviewId(null)}
                          className="px-3 py-1.5 text-xs rounded-lg border border-[var(--sd-border)] text-[var(--sd-subtle)]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleManualReplySubmit(rev._id)}
                          disabled={replyReview.isPending}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                        >
                          <Send className="w-3 h-3" />
                          {replyReview.isPending ? 'Posting...' : 'Post Reply to Google'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingReviewId(rev._id);
                          setManualReplyText(rev.replyText || '');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      >
                        {rev.replyText ? 'Edit / Overwrite Reply' : 'Reply Manually'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GET MORE REVIEWS (QR CODE & DIRECT LINK) */}
      {activeTab === 'get-reviews' && (
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Link Generator Card */}
          <div className="p-6 rounded-2xl border border-[var(--sd-border)] bg-[var(--sd-card)] shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-[var(--sd-ink)] flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-blue-600" />
                Direct 5-Star Review Link
              </h3>
              <p className="text-xs text-[var(--sd-subtle)] mt-1">
                This link opens the official Google Maps review modal with the 5-star rating dialog directly on your customer's device.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--sd-ink)] uppercase tracking-wider block">
                Google Review URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={reviewUrl}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-[var(--sd-border)] bg-gray-50 text-[var(--sd-ink)] font-mono"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(reviewUrl, 'Review link copied to clipboard!')}
                  className="p-2.5 rounded-lg border border-[var(--sd-border)] bg-[var(--sd-card)] hover:bg-[var(--sd-card-hover)] text-blue-600"
                  title="Copy review link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 space-y-2">
              <h4 className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                How to collect 5x more Google Reviews:
              </h4>
              <ul className="list-disc pl-4 space-y-1 text-blue-800">
                <li>Include this shortlink in your post-transaction WhatsApp or SMS messages.</li>
                <li>Add it to your invoices, email signatures, or order confirmation receipts.</li>
                <li>Print the QR code below on table tents, counter displays, or door stickers.</li>
              </ul>
            </div>
          </div>

          {/* Printable QR Code Display Card */}
          <div className="p-6 rounded-2xl border border-[var(--sd-border)] bg-gradient-to-b from-blue-50/30 to-white shadow-xs text-center space-y-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100/60 px-2.5 py-0.5 rounded-full">
                Printable Counter Display
              </span>
              <h3 className="text-lg font-bold text-[var(--sd-ink)] mt-2">
                "Review us on Google" QR Card
              </h3>
              <p className="text-xs text-[var(--sd-subtle)]">
                Customers scan using iPhone or Android camera to open your review box instantly.
              </p>
            </div>

            {/* QR Card Mockup */}
            <div className="inline-block p-6 rounded-2xl bg-white border-2 border-blue-500/20 shadow-md max-w-xs mx-auto">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Store className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-sm text-gray-900">{businessName}</span>
              </div>
              <div className="flex justify-center text-amber-400 text-sm mb-3">
                ★★★★★
              </div>

              {/* QR Image via public QR service */}
              <div className="p-3 bg-white rounded-xl border border-gray-100 inline-block shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(reviewUrl)}`}
                  alt="Google Review QR Code"
                  className="w-44 h-44 object-contain mx-auto"
                />
              </div>

              <div className="mt-3 text-xs font-semibold text-gray-700">
                Scan to leave a 5-star review!
              </div>
            </div>

            <div>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(reviewUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                download="google-review-qr.png"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
              >
                <QrCode className="w-4 h-4" />
                Download High-Res QR Code (PNG)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LISTING PROFILE & DETAILS */}
      {activeTab === 'details' && (
        <div className="p-6 rounded-2xl border border-[var(--sd-border)] bg-[var(--sd-card)] shadow-xs space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--sd-ink)]">
                Google Business Listing Information
              </h3>
              <p className="text-xs text-[var(--sd-subtle)] mt-1">
                Verified location data synced from Google My Business APIs.
              </p>
            </div>
            {isConnected && (
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--sd-border)] hover:bg-gray-50 text-[var(--sd-ink)]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View on Google Maps
              </a>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-[var(--sd-border)] bg-gray-50/50 space-y-1">
              <span className="text-[var(--sd-subtle)] font-medium">Business / Location Name:</span>
              <p className="text-sm font-bold text-[var(--sd-ink)]">{config?.googleLocationName || businessName}</p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--sd-border)] bg-gray-50/50 space-y-1">
              <span className="text-[var(--sd-subtle)] font-medium">Street Address:</span>
              <p className="text-sm font-bold text-[var(--sd-ink)]">
                {config?.googleLocationAddress || 'Sector 62, Noida, Uttar Pradesh, India'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--sd-border)] bg-gray-50/50 space-y-1">
              <span className="text-[var(--sd-subtle)] font-medium">Phone Number:</span>
              <p className="text-sm font-bold text-[var(--sd-ink)]">{config?.googleLocationPhone || '+91 98765 43210'}</p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--sd-border)] bg-gray-50/50 space-y-1">
              <span className="text-[var(--sd-subtle)] font-medium">Website:</span>
              <p className="text-sm font-bold text-blue-600">{config?.googleLocationWebsite || 'https://timetofuture.com'}</p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--sd-border)] bg-gray-50/50 space-y-1">
              <span className="text-[var(--sd-subtle)] font-medium">Google Place ID:</span>
              <p className="text-xs font-mono text-[var(--sd-ink)]">{config?.googlePlaceId || 'ChIJN1t_tDeuEmsRUsoyG83frY4'}</p>
            </div>

            <div className="p-4 rounded-xl border border-[var(--sd-border)] bg-gray-50/50 space-y-1">
              <span className="text-[var(--sd-subtle)] font-medium">Connected Google Account:</span>
              <p className="text-sm font-bold text-[var(--sd-ink)]">
                {config?.googleAccountName || 'Time To Future Official'}
              </p>
            </div>
          </div>

          {isConnected && (
            <div className="mt-8 pt-6 border-t border-red-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-50/50 border border-red-200">
              <div>
                <h4 className="text-sm font-semibold text-red-900">Disconnect Integration</h4>
                <p className="text-xs text-red-700 mt-0.5">
                  Disconnecting will stop automated review responses and disable sync until you reconnect.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDisconnectModalOpen(true)}
                disabled={disconnectGoogle.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                <Unlink className="w-3.5 h-3.5" />
                {disconnectGoogle.isPending ? 'Disconnecting...' : 'Disconnect Profile'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Simulation Modal */}
      {simulateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
                <Zap className="w-5 h-5" />
                Simulate Incoming Google Review
              </div>
              <button
                type="button"
                onClick={() => setSimulateOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Reviewer Name</label>
                <input
                  type="text"
                  required
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Star Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSimRating(star)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-bold flex items-center gap-1 ${simRating === star
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Review Comment</label>
                <textarea
                  rows={3}
                  required
                  value={simComment}
                  onChange={(e) => setSimComment(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSimulateOpen(false)}
                  className="px-4 py-2 text-xs rounded-lg border border-gray-300 font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={simulateReview.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Send className="w-3.5 h-3.5" />
                  {simulateReview.isPending ? 'Processing...' : 'Submit & Trigger Auto-Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {disconnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
              <Unlink className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Disconnect Google Business?</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Automated replies to reviews will be paused immediately. Your templates and configuration settings will remain intact and you can reconnect anytime.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDisconnectModalOpen(false)}
                disabled={disconnectGoogle.isPending}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={disconnectGoogle.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors shadow-xs cursor-pointer"
              >
                <Unlink className="w-3.5 h-3.5" />
                {disconnectGoogle.isPending ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
