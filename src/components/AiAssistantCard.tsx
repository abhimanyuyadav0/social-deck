import { useEffect, useState } from 'react';
import { toast } from 'glintly-ui';
import { Sparkles, X, TriangleAlert } from 'lucide-react';
import { useAiConfig, useAiUsage, useConnectAi, useDisconnectAi } from '@/api/services/socialDeck';
import type { AiProvider } from '@/api/services/socialDeck';

const PROVIDER_USAGE_URL: Record<AiProvider, string> = {
  openai: 'https://platform.openai.com/usage',
  gemini: 'https://ai.dev/rate-limit',
};

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/** Ticks every second while a retryAt is in the future — purely for the "try again in Xs" label. */
function useCountdown(target: string | null) {
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (!target) return null;
  const ms = new Date(target).getTime() - Date.now();
  return ms > 0 ? ms : 0;
}

const PROVIDER_INFO: Record<
  AiProvider,
  { label: string; keyPlaceholder: string; helpUrl: string; helpLabel: string; looksValid: (key: string) => boolean }
> = {
  openai: {
    label: 'OpenAI',
    keyPlaceholder: 'sk-...',
    helpUrl: 'https://platform.openai.com/api-keys',
    helpLabel: 'platform.openai.com',
    looksValid: (key) => key.trim().startsWith('sk-'),
  },
  gemini: {
    label: 'Gemini',
    keyPlaceholder: 'AIza...',
    helpUrl: 'https://aistudio.google.com/app/api-keys',
    helpLabel: 'aistudio.google.com',
    looksValid: (key) => key.trim().length > 10,
  },
};

function ConnectAiModal({
  open,
  onClose,
  onSubmit,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (provider: AiProvider, apiKey: string) => void;
  pending: boolean;
}) {
  const [provider, setProvider] = useState<AiProvider>('openai');
  const [apiKey, setApiKey] = useState('');

  if (!open) return null;
  const info = PROVIDER_INFO[provider];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900">Connect AI Assistant</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Used only to generate drafts{provider === 'openai' ? '/images' : ''} you ask for — billing
              stays on your own {info.label} account.
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Provider</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PROVIDER_INFO) as AiProvider[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                className={`px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  provider === p
                    ? 'border-violet-400 bg-violet-50 text-violet-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {PROVIDER_INFO[p].label}
              </button>
            ))}
          </div>
          {provider === 'gemini' && (
            <p className="text-[11px] text-amber-600 mt-1.5">
              Text drafts only for now — image generation still needs an OpenAI connection.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{info.label} API key</label>
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={info.keyPlaceholder}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-mono"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Get a key from{' '}
            <a href={info.helpUrl} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">
              {info.helpLabel}
            </a>
            .
          </p>
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
            disabled={pending || !info.looksValid(apiKey)}
            onClick={() => onSubmit(provider, apiKey.trim())}
            className="px-4 py-2 text-sm rounded-xl bg-violet-600 text-white font-semibold disabled:opacity-50"
          >
            {pending ? 'Connecting…' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDisconnectAiModal({
  open,
  onClose,
  onConfirm,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Disconnect AI Assistant?</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Compose and Auto Run won&apos;t be able to draft posts or images on any platform until
          you reconnect it.
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

/** Global — AI powers drafts/images across every platform, so it doesn't belong on any one page. */
export default function AiAssistantCard() {
  const { data } = useAiConfig();
  const connectAi = useConnectAi();
  const disconnectAi = useDisconnectAi();
  const [showModal, setShowModal] = useState(false);
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);

  const ai = data?.data?.ai;
  const hasAi = !!ai?.connected;
  const providerLabel = ai?.provider ? PROVIDER_INFO[ai.provider]?.label || ai.provider : 'OpenAI';

  const { data: usageData } = useAiUsage(hasAi);
  const usage = usageData?.data?.usage;
  const lastError = usage?.lastError;
  const retryCountdownMs = useCountdown(lastError?.retryAt ?? null);

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 flex items-start gap-3">
      <ConnectAiModal
        open={showModal}
        onClose={() => setShowModal(false)}
        pending={connectAi.isPending}
        onSubmit={(provider, apiKey) =>
          connectAi.mutate(
            { apiKey, provider },
            {
              onSuccess: () => {
                toast.success('AI connected');
                setShowModal(false);
              },
              onError: (e: Error) => toast.error(e.message),
            },
          )
        }
      />
      <ConfirmDisconnectAiModal
        open={confirmingDisconnect}
        pending={disconnectAi.isPending}
        onClose={() => setConfirmingDisconnect(false)}
        onConfirm={() =>
          disconnectAi.mutate(undefined, {
            onSuccess: () => {
              toast.success('AI disconnected');
              setConfirmingDisconnect(false);
            },
            onError: (e: Error) => toast.error(e.message),
          })
        }
      />

      <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
        <Sparkles className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">AI Assistant{hasAi ? ` (${providerLabel})` : ''}</p>
        <p className="text-xs text-[var(--sd-muted)] mt-0.5">
          Powers drafts and images across every platform&apos;s Compose and Auto Run.
        </p>
        {hasAi && ai?.keyPrefix && (
          <p className="text-xs text-emerald-700 mt-1 font-mono">
            Connected · {ai.keyPrefix}… · {ai.model}
          </p>
        )}
        {hasAi && usage && (
          <div className="mt-1.5 text-xs text-[var(--sd-muted)] space-y-0.5">
            <p>
              {usage.callsLastHour} call{usage.callsLastHour === 1 ? '' : 's'} in the last hour ·{' '}
              {usage.callsLast24h} in the last 24h
            </p>
            {lastError && (
              <p className={`flex items-center gap-1 ${lastError.rateLimited ? 'text-amber-600' : 'text-red-600'}`}>
                <TriangleAlert className="w-3 h-3 shrink-0" />
                {lastError.rateLimited ? 'Rate limited' : `Error ${lastError.statusCode}`} on{' '}
                {new Date(lastError.at).toLocaleTimeString()}
                {retryCountdownMs !== null && retryCountdownMs > 0
                  ? ` — retry in ${formatCountdown(retryCountdownMs)}`
                  : ''}
              </p>
            )}
            <a
              href={PROVIDER_USAGE_URL[ai?.provider || 'gemini']}
              target="_blank"
              rel="noreferrer"
              className="text-purple-600 hover:underline inline-block"
            >
              View exact quota/usage on {ai?.provider === 'openai' ? 'OpenAI' : 'Google'}&apos;s
              dashboard ↗
            </a>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {hasAi ? (
          <>
            <span className="text-xs text-emerald-600 font-medium">Connected</span>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-xs text-purple-600 hover:underline"
            >
              Update key
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDisconnect(true)}
              className="text-xs text-gray-500 hover:text-red-600"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
