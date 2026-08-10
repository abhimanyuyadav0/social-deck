import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'glintly-ui';
import { Users, Trash2, X, ExternalLink, Key, Sparkles, Linkedin } from 'lucide-react';
import {
  useConnections,
  useConnectCommunity,
  useStartLinkedInConnect,
  useDisconnectConnection,
  usePlatforms,
  useAiConfig,
  useConnectAi,
  useDisconnectAi,
  useSaveAiProfile,
  type AiProfile,
} from '@/api/services/socialDeck';

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

function AiContextForm({
  initial,
  onSave,
  pending,
}: {
  initial: AiProfile;
  onSave: (profile: Partial<AiProfile>) => void;
  pending: boolean;
}) {
  const [aboutYou, setAboutYou] = useState(initial.aboutYou);
  const [goals, setGoals] = useState(initial.goals);
  const [references, setReferences] = useState(initial.references);
  const [voice, setVoice] = useState(initial.voice);
  const [audience, setAudience] = useState(initial.audience);

  useEffect(() => {
    setAboutYou(initial.aboutYou);
    setGoals(initial.goals);
    setReferences(initial.references);
    setVoice(initial.voice);
    setAudience(initial.audience);
  }, [initial]);

  return (
    <div className="mt-4 pt-4 border-t border-violet-100 space-y-3">
      <div>
        <p className="text-sm font-semibold text-violet-900">Your AI context</p>
        <p className="text-xs text-[var(--sd-muted)] mt-0.5">
          Saved once — included in every generation so AI knows who you are, your goals, and what to
          reference.
        </p>
      </div>
      <div className="space-y-2">
        <label className="block">
          <span className="text-xs font-medium text-gray-600">Who you are</span>
          <textarea
            rows={2}
            value={aboutYou}
            onChange={(e) => setAboutYou(e.target.value)}
            placeholder="e.g. Full-stack developer at Acme, 5 yrs React/Node, building in public…"
            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-y"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-600">What you&apos;re trying to accomplish</span>
          <textarea
            rows={2}
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="e.g. Grow Community following, share learning notes, promote my SaaS…"
            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-y"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-600">References</span>
          <textarea
            rows={3}
            value={references}
            onChange={(e) => setReferences(e.target.value)}
            placeholder="Links, projects, stats, talking points — one per line&#10;https://myapp.com&#10;Shipped v2 last week with 40% faster builds"
            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-y font-mono text-[13px]"
          />
        </label>
        <div className="grid sm:grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Voice / tone</span>
            <input
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              placeholder="Friendly, direct, no jargon"
              className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Audience</span>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Developers, founders, students…"
              className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
            />
          </label>
        </div>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          onSave({ aboutYou, goals, references, voice, audience })
        }
        className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save AI context'}
      </button>
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
  const saveAiProfile = useSaveAiProfile();

  const ai = aiData?.data?.ai;
  const profile = aiData?.data?.profile ?? {
    aboutYou: '',
    goals: '',
    references: '',
    voice: '',
    audience: '',
  };
  const hasAi = !!ai?.connected;

  const connections = data?.data?.connections ?? [];
  const communityConn = connections.find((c) => c.type === 'ttf_community');
  const hasCommunity = communityConn?.status === 'connected';
  const linkedInConn = connections.find((c) => c.type === 'linkedin');
  const hasLinkedIn = linkedInConn?.status === 'connected';

  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

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

      <div>
        <h1 className="sd-display text-xl font-bold">Connections</h1>
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
            <p className="font-semibold text-sm">Time To Future Community</p>
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
            <p className="font-semibold text-sm">LinkedIn</p>
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
            <p className="font-semibold text-sm">AI Assistant (OpenAI)</p>
            <p className="text-xs text-[var(--sd-muted)]">
              Connect your OpenAI key to draft posts from a prompt in Compose — tailored to the
              platforms you select.
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
        <AiContextForm
          initial={profile}
          pending={saveAiProfile.isPending}
          onSave={(body) =>
            saveAiProfile.mutate(body, {
              onSuccess: () => toast.success('AI context saved'),
              onError: (e: Error) => toast.error(e.message),
            })
          }
        />
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
                <div>
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
                </div>
                {c.status === 'connected' && (
                  <button
                    type="button"
                    onClick={() =>
                      disconnect.mutate(c.id, {
                        onSuccess: () => toast.success('Disconnected'),
                      })
                    }
                    className="p-2 text-gray-400 hover:text-red-600"
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
