import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'glintly-ui';
import {
  Users,
  X,
  ExternalLink,
  Key,
  Sparkles,
  Linkedin,
  Youtube,
  Instagram,
  CircleAlert,
} from 'lucide-react';
import {
  useConnections,
  useConnectCommunity,
  useStartLinkedInConnect,
  useStartYouTubeConnect,
  useStartInstagramConnect,
  useDisconnectConnection,
  usePlatforms,
  useAiConfig,
  useConnectAi,
  useDisconnectAi,
} from '@/api/services/socialDeck';
import {
  CommunityHelpModal,
  LinkedInHelpModal,
  YouTubeHelpModal,
  InstagramHelpModal,
  AiHelpModal,
} from '@/components/ConnectorHelpModals';

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
            <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Youtube className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">YouTube</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Click Connect on YouTube and approve access on Google&apos;s consent screen to link
                your channel. Publishing isn&apos;t supported yet — it requires a video file.
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
              <Instagram className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Instagram</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Click Connect on Instagram and sign in with Instagram — no Facebook Page needed.
                Requires a Business or Creator account, and posts need an image, since Instagram
                doesn&apos;t support text-only posts.
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
  const { data } = useConnections();
  const { data: platformsData } = usePlatforms();
  const connectCommunity = useConnectCommunity();
  const startLinkedIn = useStartLinkedInConnect();
  const startYouTube = useStartYouTubeConnect();
  const startInstagram = useStartInstagramConnect();
  const disconnect = useDisconnectConnection();
  const { data: aiData } = useAiConfig();
  const connectAi = useConnectAi();
  const disconnectAi = useDisconnectAi();

  const ai = aiData?.data?.ai;
  const hasAi = !!ai?.connected;

  const connections = data?.data?.connections ?? [];
  const communityConn = connections.find((c) => c.type === 'ttf_community');
  const hasCommunity = communityConn?.status === 'connected';
  const linkedInConn = connections.find((c) => c.type === 'linkedin');
  const hasLinkedIn = linkedInConn?.status === 'connected';
  const youtubeConn = connections.find((c) => c.type === 'youtube');
  const hasYouTube = youtubeConn?.status === 'connected';
  const instagramConn = connections.find((c) => c.type === 'instagram');
  const hasInstagram = instagramConn?.status === 'connected';

  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [helpTarget, setHelpTarget] = useState<
    'community' | 'linkedin' | 'youtube' | 'instagram' | 'ai' | null
  >(null);
  const [pendingDisconnect, setPendingDisconnect] = useState<
    { kind: 'connection'; id: string; label: string } | { kind: 'ai'; label: string } | null
  >(null);

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

  useEffect(() => {
    const status = searchParams.get('youtube');
    if (!status) return;
    if (status === 'connected') {
      toast.success('YouTube connected');
    } else if (status === 'error') {
      toast.error(searchParams.get('message') || 'YouTube connect failed');
    }
    const next = new URLSearchParams(searchParams);
    next.delete('youtube');
    next.delete('message');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const status = searchParams.get('instagram');
    if (!status) return;
    if (status === 'connected') {
      toast.success('Instagram connected');
    } else if (status === 'error') {
      toast.error(searchParams.get('message') || 'Instagram connect failed');
    }
    const next = new URLSearchParams(searchParams);
    next.delete('instagram');
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

  const connectYouTube = () => {
    startYouTube.mutate(undefined, {
      onSuccess: (res) => {
        const url = res?.data?.url;
        if (!url) {
          toast.error('No YouTube authorize URL returned');
          return;
        }
        window.location.href = url;
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  const connectInstagram = () => {
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

  const disconnectPlatform = (id: string | undefined, label: string) => {
    if (!id) return;
    setPendingDisconnect({ kind: 'connection', id, label });
  };

  const confirmDisconnect = () => {
    if (!pendingDisconnect) return;
    if (pendingDisconnect.kind === 'ai') {
      disconnectAi.mutate(undefined, {
        onSuccess: () => {
          toast.success('AI disconnected');
          setPendingDisconnect(null);
        },
        onError: (e: Error) => toast.error(e.message),
      });
      return;
    }
    disconnect.mutate(pendingDisconnect.id, {
      onSuccess: () => {
        toast.success(`${pendingDisconnect.label} disconnected`);
        setPendingDisconnect(null);
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  return (
    <div className="max-w-6xl space-y-6">
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
      <YouTubeHelpModal open={helpTarget === 'youtube'} onClose={() => setHelpTarget(null)} />
      <InstagramHelpModal open={helpTarget === 'instagram'} onClose={() => setHelpTarget(null)} />
      <AiHelpModal open={helpTarget === 'ai'} onClose={() => setHelpTarget(null)} />
      <ConfirmDisconnectModal
        open={!!pendingDisconnect}
        label={pendingDisconnect?.label || ''}
        onClose={() => setPendingDisconnect(null)}
        onConfirm={confirmDisconnect}
        pending={disconnect.isPending || disconnectAi.isPending}
      />

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
          <code className="text-purple-700">cm_...</code>), LinkedIn, YouTube, and Instagram use
          OAuth, AI uses your OpenAI key.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
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
              <button
                type="button"
                onClick={() => disconnectPlatform(communityConn?.id, 'Community')}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                Disconnect
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
              <button
                type="button"
                onClick={() => disconnectPlatform(linkedInConn?.id, 'LinkedIn')}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                Disconnect
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
          <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Youtube className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-sm">YouTube</p>
              <button
                type="button"
                onClick={() => setHelpTarget('youtube')}
                className="p-0.5 rounded-full text-amber-600 hover:bg-amber-50"
                aria-label="How to connect YouTube"
                title="How to connect YouTube"
              >
                <CircleAlert className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[var(--sd-muted)]">
              Authorize with Google to link your channel. Publishing isn&apos;t supported yet —
              YouTube requires a video file to post.
            </p>
            {hasYouTube && (
              <p className="text-xs text-emerald-700 mt-1">
                Linked as {youtubeConn?.config?.youtubeChannelTitle || 'YouTube'}
              </p>
            )}
          </div>
          {hasYouTube ? (
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs text-emerald-600 font-medium">Connected</span>
              <button
                type="button"
                onClick={connectYouTube}
                disabled={startYouTube.isPending}
                className="text-xs text-purple-600 hover:underline disabled:opacity-50"
              >
                {startYouTube.isPending ? 'Redirecting…' : 'Reconnect'}
              </button>
              <button
                type="button"
                onClick={() => disconnectPlatform(youtubeConn?.id, 'YouTube')}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={connectYouTube}
              disabled={startYouTube.isPending}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold shrink-0 disabled:opacity-50"
            >
              {startYouTube.isPending ? 'Redirecting…' : 'Connect'}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--sd-line)] bg-white p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
            <Instagram className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-sm">Instagram</p>
              <button
                type="button"
                onClick={() => setHelpTarget('instagram')}
                className="p-0.5 rounded-full text-amber-600 hover:bg-amber-50"
                aria-label="How to connect Instagram"
                title="How to connect Instagram"
              >
                <CircleAlert className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[var(--sd-muted)]">
              Sign in with Instagram to publish image posts to your Business or Creator account —
              no Facebook Page needed. Posts need an image.
            </p>
            {hasInstagram && (
              <p className="text-xs text-emerald-700 mt-1">
                Linked as @{instagramConn?.config?.instagramUsername || 'instagram'}
              </p>
            )}
          </div>
          {hasInstagram ? (
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs text-emerald-600 font-medium">Connected</span>
              <button
                type="button"
                onClick={connectInstagram}
                disabled={startInstagram.isPending}
                className="text-xs text-purple-600 hover:underline disabled:opacity-50"
              >
                {startInstagram.isPending ? 'Redirecting…' : 'Reconnect'}
              </button>
              <button
                type="button"
                onClick={() => disconnectPlatform(instagramConn?.id, 'Instagram')}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={connectInstagram}
              disabled={startInstagram.isPending}
              className="px-3 py-1.5 rounded-lg bg-pink-600 text-white text-xs font-semibold shrink-0 disabled:opacity-50"
            >
              {startInstagram.isPending ? 'Redirecting…' : 'Connect'}
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
                onClick={() => setPendingDisconnect({ kind: 'ai', label: 'AI Assistant' })}
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

    </div>
  );
}
