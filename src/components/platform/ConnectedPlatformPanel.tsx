import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'glintly-ui';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { type Connection, useDisconnectConnection } from '@/api/services/socialDeck';
import type { PlatformType } from '@/components/platform/ConnectPanel';
import ContextPanel from '@/components/platform/ContextPanel';
import ComposeSection from '@/components/platform/ComposeSection';
import PostHistorySection from '@/components/platform/PostHistorySection';
import VideoSeriesSection from '@/components/platform/VideoSeriesSection';

export const PLATFORM_LABEL: Record<PlatformType, string> = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube: 'YouTube',
  community: 'Community',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Disconnect {label}?</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Posts won&apos;t be able to publish here until you reconnect it. You can reconnect
          anytime from this page.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white font-semibold disabled:opacity-50"
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
    ...(type !== 'youtube'
      ? [
          { id: 'compose', label: 'Photo & Text Post', content: <ComposeSection connection={connection} /> },
          { id: 'posts', label: 'Post history', content: <PostHistorySection connection={connection} /> },
        ]
      : []),
    ...(type === 'instagram'
      ? [{ id: 'video-series', label: 'Video Reel Series', content: <VideoSeriesSection connection={connection} /> }]
      : []),
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  if (tabs.length <= 1) {
    return <>{tabs[0].content}</>;
  }

  return (
    <div>
      <div className="border-b border-[var(--sd-line)] flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              active.id === t.id
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-[var(--sd-muted)] hover:text-[var(--sd-ink)] hover:border-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-6">{active.content}</div>
    </div>
  );
}

/**
 * The full "connected" control surface for one platform connection — header (name + disconnect)
 * plus the Briefing/Compose/Post history/Video Series tabs. Shared by the single-account
 * PlatformPage (LinkedIn/YouTube/Community) and Instagram's multi-account detail page.
 */
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
          className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {backTo.label}
        </Link>
      )}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="sd-display text-2xl font-bold">{PLATFORM_LABEL[type]}</h1>
          <p className="text-sm text-[var(--sd-muted)] mt-0.5">Connected as {connection.name}</p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmingDisconnect(true)}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Disconnect
        </button>
      </div>

      <PlatformTabs connection={connection} type={type} />
    </div>
  );
}
