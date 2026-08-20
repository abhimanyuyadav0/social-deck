import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'glintly-ui';
import { Users, Linkedin, Youtube, Instagram, Facebook, ExternalLink, X, CircleAlert } from 'lucide-react';
import {
  useConnectCommunity,
  useStartLinkedInConnect,
  useStartYouTubeConnect,
  useStartInstagramConnect,
  useStartFacebookConnect,
} from '@/api/services/socialDeck';
import {
  CommunityHelpModal,
  LinkedInHelpModal,
  YouTubeHelpModal,
  InstagramHelpModal,
  FacebookHelpModal,
} from '@/components/ConnectorHelpModals';

export type PlatformType = 'linkedin' | 'instagram' | 'youtube' | 'community' | 'facebook';

const PLATFORM_META: Record<
  PlatformType,
  { label: string; icon: typeof Linkedin; iconBg: string; iconColor: string; description: string }
> = {
  linkedin: {
    label: 'LinkedIn',
    icon: Linkedin,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-700',
    description: 'Authorize with LinkedIn to publish posts to your personal profile.',
  },
  instagram: {
    label: 'Instagram',
    icon: Instagram,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    description:
      'Sign in with Instagram — no Facebook Page needed. Requires a Business or Creator account.',
  },
  youtube: {
    label: 'YouTube',
    icon: Youtube,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    description:
      "Authorize with Google to connect your channel. Publishing isn't supported yet — YouTube requires a video file.",
  },
  community: {
    label: 'Community',
    icon: Users,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    description: 'Get a developer key from Community → Developer, then paste it here to connect.',
  },
  facebook: {
    label: 'Facebook',
    icon: Facebook,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    description: 'Authorize with Facebook to publish text and photo posts to a Page you manage.',
  },
};

const HELP_MODALS = {
  linkedin: LinkedInHelpModal,
  youtube: YouTubeHelpModal,
  instagram: InstagramHelpModal,
  community: CommunityHelpModal,
  facebook: FacebookHelpModal,
};

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

export default function ConnectPanel({ type }: { type: PlatformType }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const meta = PLATFORM_META[type];
  const Icon = meta.icon;
  const HelpModal = HELP_MODALS[type];

  const connectCommunity = useConnectCommunity();
  const startLinkedIn = useStartLinkedInConnect();
  const startYouTube = useStartYouTubeConnect();
  const startInstagram = useStartInstagramConnect();
  const startFacebook = useStartFacebookConnect();

  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const status = searchParams.get(type);
    if (!status) return;
    if (status === 'connected') {
      toast.success(`${meta.label} connected`);
    } else if (status === 'error') {
      toast.error(searchParams.get('message') || `${meta.label} connect failed`);
    }
    const next = new URLSearchParams(searchParams);
    next.delete(type);
    next.delete('message');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setSearchParams, type]);

  const connectWithCommunityKey = (developerKey: string) => {
    connectCommunity.mutate(
      { developerKey },
      {
        onSuccess: () => {
          toast.success('Community connected');
          setShowCommunityModal(false);
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const oauthMutations = {
    linkedin: startLinkedIn,
    youtube: startYouTube,
    instagram: startInstagram,
    facebook: startFacebook,
  } as const;

  const startOAuth = () => {
    if (type === 'community') return;
    const mutation = oauthMutations[type];
    mutation.mutate(undefined, {
      onSuccess: (res) => {
        const url = res?.data?.url;
        if (!url) {
          toast.error(`No ${meta.label} authorize URL returned`);
          return;
        }
        window.location.href = url;
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  const connecting =
    startLinkedIn.isPending ||
    startYouTube.isPending ||
    startInstagram.isPending ||
    startFacebook.isPending;

  return (
    <div className="max-w-xl mx-auto mt-10">
      <ConnectCommunityModal
        open={showCommunityModal}
        onClose={() => setShowCommunityModal(false)}
        onSubmit={connectWithCommunityKey}
        pending={connectCommunity.isPending}
      />
      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />

      <div className="rounded-2xl border border-[var(--sd-line)] bg-white p-8 text-center space-y-4">
        <div
          className={`w-14 h-14 rounded-2xl ${meta.iconBg} ${meta.iconColor} flex items-center justify-center mx-auto`}
        >
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h1 className="sd-display text-xl font-bold flex items-center justify-center gap-1.5">
            {meta.label}
            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className="p-0.5 rounded-full text-amber-600 hover:bg-amber-50"
              aria-label={`${meta.label} setup guide`}
            >
              <CircleAlert className="w-4 h-4" />
            </button>
          </h1>
          <p className="text-sm text-[var(--sd-muted)] mt-1">{meta.description}</p>
        </div>
        {type === 'community' ? (
          <button
            type="button"
            onClick={() => setShowCommunityModal(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold"
          >
            Connect Community
          </button>
        ) : (
          <button
            type="button"
            onClick={startOAuth}
            disabled={connecting}
            className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold disabled:opacity-50"
          >
            {connecting ? 'Redirecting…' : `Connect ${meta.label}`}
          </button>
        )}
      </div>
    </div>
  );
}
