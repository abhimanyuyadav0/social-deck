import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'glintly-ui';
import { Instagram, Plus, CircleAlert } from 'lucide-react';
import { useConnections, useStartInstagramConnect } from '@/api/services/socialDeck';
import ConnectPanel from '@/components/platform/ConnectPanel';
import { InstagramHelpModal } from '@/components/ConnectorHelpModals';

export default function InstagramAccountsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading } = useConnections();
  const startInstagram = useStartInstagramConnect();
  const [showHelp, setShowHelp] = useState(false);

  const accounts = (data?.data?.connections ?? []).filter(
    (c) => c.type === 'instagram' && c.status === 'connected',
  );

  // When there are zero accounts, <ConnectPanel> renders below and owns this same query param
  // itself (it's also used standalone by the other platform pages) — skip here so a failed
  // first-ever connect attempt doesn't double-toast.
  useEffect(() => {
    const status = searchParams.get('instagram');
    if (!status || accounts.length === 0) return;
    if (status === 'connected') {
      toast.success('Instagram connected');
    } else if (status === 'error') {
      toast.error(searchParams.get('message') || 'Instagram connect failed');
    }
    const next = new URLSearchParams(searchParams);
    next.delete('instagram');
    next.delete('message');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setSearchParams, accounts.length]);

  const connectAnother = () => {
    startInstagram.mutate(undefined, {
      onSuccess: (res) => {
        const url = res?.data?.url;
        if (!url) {
          toast.error('No Instagram authorize URL returned');
          return;
        }
        window.location.href = url;
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading…</p>;
  }

  if (accounts.length === 0) {
    return <ConnectPanel type="instagram" />;
  }

  return (
    <div className="max-w-6xl space-y-6">
      <InstagramHelpModal open={showHelp} onClose={() => setShowHelp(false)} />

      <div>
        <h1 className="sd-display text-2xl font-bold flex items-center gap-1.5">
          Instagram
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="p-0.5 rounded-full text-amber-600 hover:bg-amber-50"
            aria-label="Instagram setup guide"
          >
            <CircleAlert className="w-4 h-4" />
          </button>
        </h1>
        <p className="text-sm text-[var(--sd-muted)] mt-0.5">
          Pick an account to manage, or connect another one.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {accounts.map((c) => (
          <Link
            key={c.id}
            to={`/instagram/${c.id}`}
            className="rounded-xl border border-[var(--sd-line)] bg-white p-4 flex items-center gap-3 hover:border-purple-300 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
              <Instagram className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{c.name}</p>
              {c.config?.instagramUsername && (
                <p className="text-xs text-gray-500 truncate">@{c.config.instagramUsername}</p>
              )}
            </div>
          </Link>
        ))}

        <button
          type="button"
          onClick={connectAnother}
          disabled={startInstagram.isPending}
          className="rounded-xl border border-dashed border-gray-300 bg-white p-4 flex items-center gap-3 text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors disabled:opacity-50"
        >
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">
            {startInstagram.isPending ? 'Redirecting…' : 'Connect another account'}
          </span>
        </button>
      </div>
    </div>
  );
}
