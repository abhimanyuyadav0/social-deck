import { useState } from 'react';
import { toast } from 'glintly-ui';
import { Sparkles, Star, TriangleAlert, ExternalLink } from 'lucide-react';
import {
  useAiConfigs,
  useAiUsage,
  useConnectAi,
  useDisconnectAi,
  useSetDefaultAi,
} from '@/api/services/socialDeck';
import type { AiConfig, AiProvider } from '@/api/services/socialDeck';
import { AI_PROVIDER_INFO, AI_PROVIDER_ORDER } from '@/components/ai/providerMeta';
import ConnectProviderModal from '@/components/ai/ConnectProviderModal';

function ConfirmDisconnectModal({
  open,
  provider,
  onClose,
  onConfirm,
  pending,
}: {
  open: boolean;
  provider: AiProvider | null;
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  if (!open || !provider) return null;
  const label = AI_PROVIDER_INFO[provider].label;

  return (
    <div className="sd-modal-overlay">
      <div className="sd-modal-panel w-full max-w-sm p-6 space-y-4">
        <h2 className="font-bold text-[var(--sd-ink)]">Disconnect {label}?</h2>
        <p className="text-sm text-[var(--sd-muted)] leading-relaxed">
          Compose and Auto Run won&apos;t be able to use {label} until you reconnect it.
        </p>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="sd-btn sd-btn-secondary px-4 py-2 text-sm">
            Cancel
          </button>
          <button type="button" disabled={pending} onClick={onConfirm} className="sd-btn sd-btn-danger px-4 py-2 text-sm">
            {pending ? 'Disconnecting…' : 'Disconnect'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProviderCard({
  provider,
  config,
  onConnect,
  onUpdateKey,
  onDisconnect,
  onSetDefault,
  settingDefault,
}: {
  provider: AiProvider;
  config?: AiConfig;
  onConnect: () => void;
  onUpdateKey: () => void;
  onDisconnect: () => void;
  onSetDefault: () => void;
  settingDefault: boolean;
}) {
  const info = AI_PROVIDER_INFO[provider];
  const connected = !!config?.connected;

  return (
    <div className="sd-card sd-card-hover p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3.5">
        <div className={`sd-icon-badge w-11 h-11 ${info.iconBg} ${info.iconColor} shrink-0`}>
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-[var(--sd-ink)]">{info.label}</p>
            {config?.isDefault && (
              <span className="sd-badge bg-purple-100 text-purple-800 inline-flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-current" />
                Default
              </span>
            )}
            {connected && !config?.isDefault && (
              <span className="sd-badge bg-emerald-100 text-emerald-800">Connected</span>
            )}
          </div>
          <p className="text-xs text-[var(--sd-muted)] mt-1 leading-relaxed">{info.blurb}</p>
          {connected && config?.keyPrefix && (
            <p className="text-xs text-emerald-700 mt-2 font-mono">
              {config.keyPrefix}… · {config.model}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--sd-line-soft)] mt-auto">
        {connected ? (
          <>
            {!config?.isDefault && (
              <button
                type="button"
                onClick={onSetDefault}
                disabled={settingDefault}
                className="sd-btn sd-btn-secondary px-3 py-1.5 text-xs"
              >
                Set as default
              </button>
            )}
            <button type="button" onClick={onUpdateKey} className="sd-btn sd-btn-ghost px-3 py-1.5 text-xs text-purple-600">
              Update key
            </button>
            <button
              type="button"
              onClick={onDisconnect}
              className="sd-btn sd-btn-ghost px-3 py-1.5 text-xs text-[var(--sd-subtle)] hover:text-red-600 ml-auto"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button type="button" onClick={onConnect} className="sd-btn sd-btn-primary px-4 py-2 text-xs w-full">
            Connect {info.label}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AiModelsPage() {
  const { data } = useAiConfigs();
  const connectAi = useConnectAi();
  const disconnectAi = useDisconnectAi();
  const setDefaultAi = useSetDefaultAi();

  const [connectModal, setConnectModal] = useState<{ provider: AiProvider; isReconnect: boolean } | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState<AiProvider | null>(null);

  const configs = data?.data?.configs ?? [];
  const configByProvider = new Map(configs.map((c) => [c.provider, c]));
  const defaultConfig = configs.find((c) => c.isDefault);
  const hasAnyConnected = configs.length > 0;

  const { data: usageData } = useAiUsage(hasAnyConnected);
  const usage = usageData?.data?.usage;

  const submitConnect = (apiKey: string) => {
    if (!connectModal) return;
    const { provider } = connectModal;
    connectAi.mutate(
      { apiKey, provider },
      {
        onSuccess: () => {
          toast.success(`${AI_PROVIDER_INFO[provider].label} connected`);
          setConnectModal(null);
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const confirmTheDisconnect = () => {
    if (!confirmDisconnect) return;
    const provider = confirmDisconnect;
    disconnectAi.mutate(provider, {
      onSuccess: () => {
        toast.success(`${AI_PROVIDER_INFO[provider].label} disconnected`);
        setConfirmDisconnect(null);
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <ConnectProviderModal
        open={!!connectModal}
        provider={connectModal?.provider ?? 'openai'}
        isReconnect={!!connectModal?.isReconnect}
        onClose={() => setConnectModal(null)}
        onSubmit={submitConnect}
        pending={connectAi.isPending}
      />
      <ConfirmDisconnectModal
        open={!!confirmDisconnect}
        provider={confirmDisconnect}
        onClose={() => setConfirmDisconnect(null)}
        onConfirm={confirmTheDisconnect}
        pending={disconnectAi.isPending}
      />

      <div>
        <h1 className="sd-display text-[26px] font-bold tracking-tight text-[var(--sd-ink)]">AI Models</h1>
        <p className="text-sm text-[var(--sd-muted)] mt-1 max-w-2xl">
          Link one or more AI providers. Compose and Auto Run always use whichever one is marked{' '}
          <strong>Default</strong> — switch it any time without losing the others' keys.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AI_PROVIDER_ORDER.map((provider) => (
          <ProviderCard
            key={provider}
            provider={provider}
            config={configByProvider.get(provider)}
            onConnect={() => setConnectModal({ provider, isReconnect: false })}
            onUpdateKey={() => setConnectModal({ provider, isReconnect: true })}
            onDisconnect={() => setConfirmDisconnect(provider)}
            onSetDefault={() =>
              setDefaultAi.mutate(provider, {
                onSuccess: () => toast.success(`${AI_PROVIDER_INFO[provider].label} is now default`),
                onError: (e: Error) => toast.error(e.message),
              })
            }
            settingDefault={setDefaultAi.isPending}
          />
        ))}
      </div>

      {hasAnyConnected && usage && (
        <div className="sd-card p-5">
          <p className="text-xs font-semibold text-[var(--sd-muted)] mb-3">Usage — across every linked provider</p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-2xl font-bold text-[var(--sd-ink)] leading-none">{usage.callsLastHour}</p>
              <p className="text-xs text-[var(--sd-subtle)] mt-1.5">calls in the last hour</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--sd-ink)] leading-none">{usage.callsLast24h}</p>
              <p className="text-xs text-[var(--sd-subtle)] mt-1.5">calls in the last 24h</p>
            </div>
          </div>
          {usage.lastError && (
            <p
              className={`mt-4 flex items-start gap-1.5 text-xs rounded-lg px-3 py-2 ${
                usage.lastError.rateLimited ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
              }`}
            >
              <TriangleAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                {AI_PROVIDER_INFO[usage.lastError.provider]?.label ?? usage.lastError.provider}:{' '}
                {usage.lastError.rateLimited ? 'Rate limited' : `Error ${usage.lastError.statusCode}`} on{' '}
                {new Date(usage.lastError.at).toLocaleString()}
              </span>
            </p>
          )}
          {defaultConfig && (
            <a
              href={AI_PROVIDER_INFO[defaultConfig.provider].usageUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-purple-600 hover:underline"
            >
              View exact quota on {AI_PROVIDER_INFO[defaultConfig.provider].usageLabel}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
