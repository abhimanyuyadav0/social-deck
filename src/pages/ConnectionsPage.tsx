import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'glintly-ui';
import {
  Users,
  Trash2,
  X,
  ExternalLink,
  Key,
  Sparkles,
  Linkedin,
  CircleAlert,
} from 'lucide-react';
import {
  useConnections,
  useConnectCommunity,
  useStartLinkedInConnect,
  useDisconnectConnection,
  usePlatforms,
  useAiConfig,
  useConnectAi,
  useDisconnectAi,
  useAiContexts,
  useSetConnectionContexts,
} from '@/api/services/socialDeck';
import {
  CommunityHelpModal,
  LinkedInHelpModal,
  AiHelpModal,
} from '@/components/ConnectorHelpModals';

function HowToConnectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5 max-h-[85dvh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900">How to connect</h2>
            <p className="text-xs text-gray-500 mt-1">
              Each connector is set up once. After that, pick them in Compose to publish.
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Community</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Sign in to Community → open{' '}
                <a
                  href="https://community.timetofuture.com/developer"
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-600 inline-flex items-center gap-0.5 hover:underline"
                >
                  Developer
                  <ExternalLink className="w-3 h-3" />
                </a>
                , create a key (<code className="text-purple-700">cm_...</code>), then paste it on
                Connect Community. Assign an AI context to it once connected.
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Linkedin className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">LinkedIn</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Click Connect on LinkedIn. Approve Social Deck in the LinkedIn consent screen —
                you&apos;ll return here when it&apos;s linked to your profile.
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">AI (OpenAI)</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Create an API key at{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-600 inline-flex items-center gap-0.5 hover:underline"
                >
                  platform.openai.com
                  <ExternalLink className="w-3 h-3" />
                </a>
                , paste it under AI Assistant, then create an AI context on Auto Run and toggle it
                on for your connections below so drafts match your voice and image style.
              </p>
            </div>
          </li>
        </ol>

        <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
          Tip: connect every platform you want to use, then in Compose select which ones to publish
          to for each post. Full guides live on the{' '}
          <Link to="/docs" className="text-purple-600 hover:underline" onClick={onClose}>
            Docs
          </Link>{' '}
          page.
        </p>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl bg-gray-900 text-white font-semibold"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function ConnectCommunityModal({
  open,
  onClose,
  onSubmit,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (developerKey: string) => void;
  pending: boolean;
}) {
  const [developerKey, setDeveloperKey] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900">Connect Community</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Community issues the developer key — not Social Deck. Sign in to{' '}
              <a
                href="https://community.timetofuture.com/developer"
                target="_blank"
                rel="noreferrer"
                className="text-purple-600 inline-flex items-center gap-0.5 hover:underline"
              >
                Community → Developer
                <ExternalLink className="w-3 h-3" />
              </a>
              , create a key (<code className="text-purple-700">cm_...</code>), and paste it below.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              You need a Community account first. Posts publish under the Community profile that
              owns the key.
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Community developer key
          </label>
          <input
            type="password"
            autoComplete="off"
            value={developerKey}
            onChange={(e) => setDeveloperKey(e.target.value)}
            placeholder="cm_..."
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-mono"
          />
        </div>
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
            disabled={pending || !developerKey.trim().startsWith('cm_')}
            onClick={() => onSubmit(developerKey.trim())}
            className="px-4 py-2 text-sm rounded-xl bg-purple-600 text-white font-semibold disabled:opacity-50"
          >
            {pending ? 'Connecting…' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConnectAiModal({
  open,
  onClose,
  onSubmit,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
  pending: boolean;
}) {
  const [apiKey, setApiKey] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900">Connect AI</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Add your OpenAI API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-purple-600 inline-flex items-center gap-0.5 hover:underline"
              >
                platform.openai.com
                <ExternalLink className="w-3 h-3" />
              </a>
              . Social Deck uses it only to draft posts from your prompts — billing is on your
              OpenAI account.
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">OpenAI API key</label>
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-mono"
          />
        </div>
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
            disabled={pending || !apiKey.trim().startsWith('sk-')}
            onClick={() => onSubmit(apiKey.trim())}
            className="px-4 py-2 text-sm rounded-xl bg-purple-600 text-white font-semibold disabled:opacity-50"
          >
            {pending ? 'Connecting…' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading } = useConnections();
  const { data: platformsData } = usePlatforms();
  const connectCommunity = useConnectCommunity();
  const startLinkedIn = useStartLinkedInConnect();
  const disconnect = useDisconnectConnection();
  const { data: aiData } = useAiConfig();
  const connectAi = useConnectAi();
  const disconnectAi = useDisconnectAi();
  const { data: contextsData } = useAiContexts();
  const setConnectionContexts = useSetConnectionContexts();

  const ai = aiData?.data?.ai;
  const hasAi = !!ai?.connected;
  const contexts = contextsData?.data?.contexts ?? [];

  const connections = data?.data?.connections ?? [];
  const communityConn = connections.find((c) => c.type === 'ttf_community');
  const hasCommunity = communityConn?.status === 'connected';
  const linkedInConn = connections.find((c) => c.type === 'linkedin');
  const hasLinkedIn = linkedInConn?.status === 'connected';

  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [helpTarget, setHelpTarget] = useState<'community' | 'linkedin' | 'ai' | null>(null);

  const toggleConnectionContext = (connectionId: string, contextId: string, currentIds: string[]) => {
    const nextIds = currentIds.includes(contextId)
      ? currentIds.filter((id) => id !== contextId)
      : [...currentIds, contextId];
    setConnectionContexts.mutate(
      { id: connectionId, contextIds: nextIds },
      { onError: (e: Error) => toast.error(e.message) },
    );
  };

  useEffect(() => {
    const status = searchParams.get('linkedin');
    if (!status) return;
    if (status === 'connected') {
      toast.success('LinkedIn connected');
    } else if (status === 'error') {
      toast.error(searchParams.get('message') || 'LinkedIn connect failed');
    }
    const next = new URLSearchParams(searchParams);
    next.delete('linkedin');
    next.delete('message');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const connectWithCommunityKey = (developerKey: string) => {
    connectCommunity.mutate(
      { developerKey },
      {
        onSuccess: () => {
          toast.success('Community connected');
          setShowCommunityModal(false);
        },
        onError: (e: Error) => toast.error(e.message),
      }
    );
  };

  const connectWithAiKey = (apiKey: string) => {
    connectAi.mutate(
      { apiKey },
      {
        onSuccess: () => {
          toast.success('AI connected');
          setShowAiModal(false);
        },
        onError: (e: Error) => toast.error(e.message),
      }
    );
  };

  const connectLinkedIn = () => {
    startLinkedIn.mutate(undefined, {
      onSuccess: (res) => {
        const url = res?.data?.url;
        if (!url) {
          toast.error('No LinkedIn authorize URL returned');
          return;
        }
        window.location.href = url;
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <ConnectCommunityModal
        open={showCommunityModal}
        onClose={() => setShowCommunityModal(false)}
        onSubmit={connectWithCommunityKey}
        pending={connectCommunity.isPending}
      />
      <ConnectAiModal
        open={showAiModal}
        onClose={() => setShowAiModal(false)}
        onSubmit={connectWithAiKey}
        pending={connectAi.isPending}
      />
      <HowToConnectModal open={showHowTo} onClose={() => setShowHowTo(false)} />
      <CommunityHelpModal
        open={helpTarget === 'community'}
        onClose={() => setHelpTarget(null)}
      />
      <LinkedInHelpModal open={helpTarget === 'linkedin'} onClose={() => setHelpTarget(null)} />
      <AiHelpModal open={helpTarget === 'ai'} onClose={() => setHelpTarget(null)} />

      <div>
        <div className="flex items-center gap-2">
          <h1 className="sd-display text-xl font-bold">Connections</h1>
          <button
            type="button"
            onClick={() => setShowHowTo(true)}
            className="p-1 rounded-full text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
            aria-label="How to connect all platforms"
            title="How to connect"
          >
            <CircleAlert className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-[var(--sd-muted)] mt-1">
          Connect platforms and AI — Community uses a developer key (
          <code className="text-purple-700">cm_...</code>), LinkedIn uses OAuth, AI uses your
          OpenAI key.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--sd-line)] bg-white p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-sm">Time To Future Community</p>
              <button
                type="button"
                onClick={() => setHelpTarget('community')}
                className="p-0.5 rounded-full text-amber-600 hover:bg-amber-50"
                aria-label="How to connect Community"
                title="How to connect Community"
              >
                <CircleAlert className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[var(--sd-muted)]">
              Create a developer key in Community, then paste it here. Posts appear under that
              Community profile.
            </p>
            {hasCommunity && (
              <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1 flex-wrap">
                <Key className="w-3 h-3 shrink-0" />
                {communityConn?.config?.ttfAuthorName || communityConn?.config?.ttfEmail ? (
                  <>
                    Linked as {communityConn.config.ttfAuthorName || communityConn.config.ttfEmail}
                    {communityConn.config.communityKeyPrefix && (
                      <> · {communityConn.config.communityKeyPrefix}…</>
                    )}
                  </>
                ) : (
                  communityConn?.config?.communityKeyPrefix && (
                    <>Key {communityConn.config.communityKeyPrefix}…</>
                  )
                )}
              </p>
            )}
          </div>
          {hasCommunity ? (
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs text-emerald-600 font-medium">Connected</span>
              <button
                type="button"
                onClick={() => setShowCommunityModal(true)}
                className="text-xs text-purple-600 hover:underline"
              >
                Update key
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCommunityModal(true)}
              className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold shrink-0"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--sd-line)] bg-white p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Linkedin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-sm">LinkedIn</p>
              <button
                type="button"
                onClick={() => setHelpTarget('linkedin')}
                className="p-0.5 rounded-full text-amber-600 hover:bg-amber-50"
                aria-label="LinkedIn OAuth setup guide"
                title="LinkedIn setup guide"
              >
                <CircleAlert className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[var(--sd-muted)]">
              Authorize with LinkedIn to publish posts to your personal profile. Requires Sign In
              with LinkedIn (OIDC) and Share on LinkedIn on your LinkedIn app.
            </p>
            {hasLinkedIn && (
              <p className="text-xs text-emerald-700 mt-1">
                Linked as{' '}
                {linkedInConn?.config?.linkedinProfileName ||
                  linkedInConn?.config?.linkedinEmail ||
                  'LinkedIn'}
                {linkedInConn?.config?.linkedinEmail &&
                  linkedInConn?.config?.linkedinProfileName && (
                    <> · {linkedInConn.config.linkedinEmail}</>
                  )}
              </p>
            )}
          </div>
          {hasLinkedIn ? (
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs text-emerald-600 font-medium">Connected</span>
              <button
                type="button"
                onClick={connectLinkedIn}
                disabled={startLinkedIn.isPending}
                className="text-xs text-purple-600 hover:underline disabled:opacity-50"
              >
                {startLinkedIn.isPending ? 'Redirecting…' : 'Reconnect'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={connectLinkedIn}
              disabled={startLinkedIn.isPending}
              className="px-3 py-1.5 rounded-lg bg-sky-700 text-white text-xs font-semibold shrink-0 disabled:opacity-50"
            >
              {startLinkedIn.isPending ? 'Redirecting…' : 'Connect'}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--sd-line)] bg-white p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-sm">AI Assistant (OpenAI)</p>
              <button
                type="button"
                onClick={() => setHelpTarget('ai')}
                className="p-0.5 rounded-full text-amber-600 hover:bg-amber-50"
                aria-label="How to connect AI"
                title="How to connect AI"
              >
                <CircleAlert className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[var(--sd-muted)]">
              Connect your OpenAI key to draft posts. Create AI contexts on{' '}
              <Link to="/auto" className="text-purple-600 hover:underline">
                Auto Run
              </Link>{' '}
              (who you are, voice, image style) and toggle them on for connections below — a
              connection can belong to more than one context.
            </p>
            {hasAi && ai?.keyPrefix && (
              <p className="text-xs text-emerald-700 mt-1 font-mono">
                Connected · {ai.keyPrefix}… · {ai.model || 'gpt-4o-mini'}
              </p>
            )}
          </div>
          {hasAi ? (
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs text-emerald-600 font-medium">Connected</span>
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="text-xs text-purple-600 hover:underline"
              >
                Update key
              </button>
              <button
                type="button"
                onClick={() =>
                  disconnectAi.mutate(undefined, {
                    onSuccess: () => toast.success('AI disconnected'),
                  })
                }
                className="text-xs text-gray-500 hover:text-red-600"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold shrink-0"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {(platformsData?.data?.platforms ?? []).some((p) => p.status === 'coming_soon') && (
        <div>
          <h2 className="text-sm font-semibold mb-2">Coming soon</h2>
          <div className="flex flex-wrap gap-2">
            {(platformsData?.data?.platforms ?? [])
              .filter((p) => p.status === 'coming_soon')
              .map((p) => (
                <span
                  key={p.id}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-500"
                >
                  {p.name}
                </span>
              ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold mb-2">Active connections</h2>
        {isLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : connections.length === 0 ? (
          <p className="text-sm text-gray-400">No connections yet.</p>
        ) : (
          <ul className="space-y-2">
            {connections.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 bg-white text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {c.type.replace(/_/g, ' ')} · {c.status}
                  </p>
                  {c.config?.ttfEmail && (
                    <p className="text-xs text-gray-400 mt-0.5">{c.config.ttfEmail}</p>
                  )}
                  {c.config?.communityKeyPrefix && (
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                      {c.config.communityKeyPrefix}…
                    </p>
                  )}
                  {c.config?.linkedinEmail && (
                    <p className="text-xs text-gray-400 mt-0.5">{c.config.linkedinEmail}</p>
                  )}
                  {c.lastError && <p className="text-xs text-red-500 mt-0.5">{c.lastError}</p>}
                  {c.status === 'connected' && (
                    <div className="mt-1.5">
                      <p className="text-[11px] text-gray-500 mb-1">AI contexts</p>
                      {contexts.length === 0 ? (
                        <p className="text-[11px] text-gray-400">
                          <Link to="/auto" className="text-purple-600 hover:underline">
                            Create one on Auto Run
                          </Link>
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {contexts.map((ctx) => {
                            const active = c.contextIds.includes(ctx.id);
                            return (
                              <button
                                key={ctx.id}
                                type="button"
                                onClick={() => toggleConnectionContext(c.id, ctx.id, c.contextIds)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                                  active
                                    ? 'bg-violet-600 text-white border-violet-600'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-violet-300'
                                }`}
                              >
                                {ctx.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {c.status === 'connected' && (
                  <button
                    type="button"
                    onClick={() =>
                      disconnect.mutate(c.id, {
                        onSuccess: () => toast.success('Disconnected'),
                      })
                    }
                    className="p-2 text-gray-400 hover:text-red-600 shrink-0"
                    aria-label="Disconnect"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
