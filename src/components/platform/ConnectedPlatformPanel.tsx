import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'glintly-ui';
import { ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react';
import { type Connection, useDisconnectConnection } from '@/api/services/socialDeck';
import type { PlatformType } from '@/components/platform/ConnectPanel';
import ContextPanel from '@/components/platform/ContextPanel';
import AiSettingsPanel from '@/components/platform/AiSettingsPanel';
import PostHistorySection from '@/components/platform/PostHistorySection';
import VideoSeriesSection from '@/components/platform/VideoSeriesSection';

export const PLATFORM_LABEL: Record<PlatformType, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube: 'YouTube',
  community: 'Community',
  facebook: 'Facebook',
};

function ConfirmDisconnectModal({
  open,
  label,
  onClose,
  onConfirm,
  pending,
}: {
  open: boolean;
  label: string;
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  if (!open) return null;

  return (
    <div className="sd-modal-overlay">
      <div className="sd-modal-panel w-full max-w-sm p-6 space-y-4 border border-slate-200">
        <h2 className="text-base font-bold text-slate-900">Disconnect {label}?</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Posts won&apos;t be able to publish here until you reconnect it. You can reconnect
          anytime from this page.
        </p>
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="sd-btn sd-btn-secondary px-4 py-2 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="sd-btn sd-btn-danger px-4 py-2 text-xs"
          >
            {pending ? 'Disconnecting…' : 'Disconnect'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlatformTabs({ connection, type }: { connection: Connection; type: PlatformType }) {
  const tabs = [
    { id: 'briefing', label: 'Briefing & Auto Run', content: <ContextPanel connection={connection} /> },
    { id: 'settings', label: 'AI Settings', content: <AiSettingsPanel connection={connection} /> },
    {
      id: 'posts',
      label: type === 'youtube' ? 'Publish History' : 'Post History',
      content: <PostHistorySection connection={connection} />,
    },
    ...(type === 'instagram' || type === 'youtube'
      ? [
          {
            id: 'video-series',
            label: type === 'youtube' ? 'YouTube Shorts Series' : 'Video Reel Series',
            content: <VideoSeriesSection connection={connection} />,
          },
        ]
      : []),
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabs.some((t) => t.id === tabFromUrl) ? (tabFromUrl as string) : tabs[0].id,
  );
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  const selectTab = (id: string) => {
    setActiveTab(id);
    const next = new URLSearchParams(searchParams);
    next.set('tab', id);
    setSearchParams(next, { replace: true });
  };

  if (tabs.length <= 1) {
    return <>{tabs[0].content}</>;
  }

  return (
    <div className="space-y-6">
      {/* Modern Segmented Navigation Tabs */}
      <div className="inline-flex p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 gap-1 overflow-x-auto max-w-full">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all duration-150 ${
              active.id === t.id
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>{active.content}</div>
    </div>
  );
}

export default function ConnectedPlatformPanel({
  connection,
  type,
  backTo,
}: {
  connection: Connection;
  type: PlatformType;
  backTo?: { to: string; label: string };
}) {
  const disconnect = useDisconnectConnection();
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);

  return (
    <div className="max-w-6xl space-y-6">
      <ConfirmDisconnectModal
        open={confirmingDisconnect}
        label={PLATFORM_LABEL[type]}
        pending={disconnect.isPending}
        onClose={() => setConfirmingDisconnect(false)}
        onConfirm={() =>
          disconnect.mutate(connection.id, {
            onSuccess: () => {
              toast.success(`${PLATFORM_LABEL[type]} disconnected`);
              setConfirmingDisconnect(false);
            },
            onError: (e: Error) => toast.error(e.message),
          })
        }
      />

      {backTo && (
        <Link
          to={backTo.to}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {backTo.label}
        </Link>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="sd-badge bg-emerald-50 text-emerald-700 border-emerald-200">
              <span className="sd-pulse-dot bg-emerald-500" />
              Active Connection
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Channel Synchronized</span>
          </div>
          <h1 className="sd-display text-2xl font-extrabold text-slate-900 tracking-tight">
            {PLATFORM_LABEL[type]}
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              Connected as <strong className="text-slate-700">{connection.name}</strong>
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setConfirmingDisconnect(true)}
          className="sd-btn sd-btn-ghost text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 shrink-0 self-start sm:self-center"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Disconnect Channel
        </button>
      </div>

      <PlatformTabs connection={connection} type={type} />
    </div>
  );
}

