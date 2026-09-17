import { useState } from 'react';
import { toast } from 'glintly-ui';
import {
  Sparkles,
  Star,
  TriangleAlert,
  ExternalLink,
  Info,
  Check,
  Zap,
  Activity,
  ChevronDown,
  ChevronUp,
  Video,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
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
      <div className="sd-modal-panel w-full max-w-sm p-6 space-y-4 border border-slate-200">
        <h2 className="text-base font-bold text-slate-900">Disconnect {label}?</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Compose and Auto Run won&apos;t be able to generate content with {label} until you
          reconnect an active API key.
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

const PROVIDER_THEMES: Record<
  AiProvider,
  {
    gradient: string;
    border: string;
    badgeBg: string;
    capabilities: Array<{ label: string; icon: typeof FileText }>;
  }
> = {
  gemini: {
    gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
    border: 'hover:border-blue-300',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    capabilities: [
      { label: 'Text Generation', icon: FileText },
      { label: 'Nano Banana Images', icon: ImageIcon },
      { label: 'Veo 3.1 Reels Video', icon: Video },
    ],
  },
  openai: {
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    border: 'hover:border-emerald-300',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    capabilities: [
      { label: 'GPT Text Drafts', icon: FileText },
      { label: 'DALL-E Images', icon: ImageIcon },
    ],
  },
  claude: {
    gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    border: 'hover:border-amber-300',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    capabilities: [{ label: 'Claude Sonnet Text', icon: FileText }],
  },
};

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
  const theme = PROVIDER_THEMES[provider];
  const connected = !!config?.connected;

  return (
    <div
      className={`sd-card sd-card-hover p-6 flex flex-col justify-between gap-5 relative overflow-hidden ${theme.border}`}
    >
      {/* Subtle brand ambient glow */}
      <div
        className={`absolute top-0 right-0 w-44 h-44 bg-gradient-to-br ${theme.gradient} rounded-full blur-xl pointer-events-none -mr-10 -mt-10`}
      />

      <div className="space-y-4 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`sd-icon-badge w-11 h-11 ${info.iconBg} ${info.iconColor} shadow-xs`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-slate-900">{info.label}</h3>
                {config?.isDefault && (
                  <span className="sd-badge bg-indigo-50 text-indigo-700 border-indigo-200">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    Default Engine
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {connected ? 'Key verified & active' : 'Not configured'}
              </p>
            </div>
          </div>

          {connected && !config?.isDefault && (
            <span className="sd-badge bg-emerald-50 text-emerald-700 border-emerald-200">
              <span className="sd-pulse-dot bg-emerald-500" />
              Connected
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">{info.blurb}</p>

        {/* Feature Capabilities Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {theme.capabilities.map((cap) => (
            <span
              key={cap.label}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-[10px] font-semibold text-slate-600"
            >
              <cap.icon className="w-3 h-3 text-indigo-500" />
              {cap.label}
            </span>
          ))}
        </div>

        {connected && config?.keyPrefix && (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium text-[11px]">API Key:</span>
            <span className="font-mono text-slate-700 font-semibold text-[11px]">
              {config.keyPrefix}••••••••
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 mt-auto relative z-10">
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
            <button
              type="button"
              onClick={onUpdateKey}
              className="sd-btn sd-btn-ghost px-3 py-1.5 text-xs text-indigo-600 font-semibold hover:bg-indigo-50"
            >
              Update key
            </button>
            <button
              type="button"
              onClick={onDisconnect}
              className="sd-btn sd-btn-ghost px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 ml-auto"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            className="sd-btn sd-btn-primary px-4 py-2 text-xs w-full shadow-xs"
          >
            Connect {info.label}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Detailed Diagnostic & Resolution Advisor for Gemini Pro & Rate Limits
 */
function GeminiRateLimitAdvisor({
  lastError,
  geminiConnected,
}: {
  lastError: {
    at: string;
    statusCode: number;
    rateLimited: boolean;
    message: string;
    provider: AiProvider;
    retryAfterSeconds: number;
  } | null;
  geminiConnected: boolean;
}) {
  const [expanded, setExpanded] = useState(lastError?.provider === 'gemini');

  const isGeminiError = lastError?.provider === 'gemini';

  return (
    <div
      className={`sd-card p-5 border transition-colors ${
        isGeminiError
          ? 'bg-amber-50/50 border-amber-200 shadow-sm'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`sd-icon-badge w-10 h-10 shrink-0 ${
              isGeminiError ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'
            }`}
          >
            {isGeminiError ? <TriangleAlert className="w-5 h-5" /> : <Info className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900">
                {isGeminiError
                  ? 'Gemini Rate Limit / Quota Exceeded Detected'
                  : 'Have "Gemini Pro" / Google One? Understand API Quotas & Limits'}
              </h3>
              {isGeminiError ? (
                <span className="sd-badge bg-amber-100 text-amber-800 font-bold">
                  Status 429
                </span>
              ) : (
                <span className="sd-badge bg-slate-100 text-slate-700">
                  {geminiConnected ? 'Gemini Key Linked' : 'Gemini Not Linked'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Why your Google account might show "Limit Reached" even with a paid Gemini Pro subscription.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 shrink-0"
          aria-label="Toggle details"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Real-time Error Diagnostic Box if error exists */}
      {isGeminiError && (
        <div className="mt-4 p-3.5 rounded-xl bg-white border border-amber-200/80 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-semibold text-slate-700">
            <span>Last Google API Response:</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {new Date(lastError.at).toLocaleTimeString()}
            </span>
          </div>
          <p className="font-mono text-amber-800 text-[11px] bg-amber-50 p-2 rounded-md break-all">
            {lastError.message || '429 RESOURCE_EXHAUSTED: Rate limit or daily quota reached.'}
          </p>
          {lastError.retryAfterSeconds > 0 && (
            <p className="text-[11px] text-slate-500">
              Google requested retry delay: <strong>{lastError.retryAfterSeconds} seconds</strong>.
            </p>
          )}
        </div>
      )}

      {/* Explanatory Guide Content */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-200/70 space-y-3.5 text-xs text-slate-600">
          <div className="grid sm:grid-cols-2 gap-3.5">
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                1. Consumer Gemini Pro vs. API Keys
              </p>
              <p className="text-[11px] leading-relaxed text-slate-500">
                A Google One AI Premium (Gemini Advanced/Pro) plan gives access to chat at{' '}
                <strong>gemini.google.com</strong>. It <em>does not</em> include developer API quota for automated external apps like Social Deck.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                2. Free Tier Limits in Google AI Studio
              </p>
              <p className="text-[11px] leading-relaxed text-slate-500">
                New API keys created in Google AI Studio start on the <strong>Free Tier</strong>:
                strictly capped at <strong>50 calls per day</strong> for Pro models, and <strong>0 quota for Veo video</strong>.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-indigo-900 text-xs">
                How to get high limits & unlock Veo video:
              </p>
              <p className="text-[11px] text-indigo-700/90 mt-0.5">
                Enable Pay-as-you-go billing in Google AI Studio. You only pay fractions of a cent per request and the 50 calls/day limit is completely removed.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://aistudio.google.com/app/plan_information"
                target="_blank"
                rel="noreferrer"
                className="sd-btn sd-btn-primary px-3.5 py-1.5 text-xs"
              >
                Set Up AI Studio Billing
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://ai.dev/rate-limit"
                target="_blank"
                rel="noreferrer"
                className="sd-btn sd-btn-secondary px-3 py-1.5 text-xs"
              >
                View Rate Limits
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AiModelsPage() {
  const { data } = useAiConfigs();
  const connectAi = useConnectAi();
  const disconnectAi = useDisconnectAi();
  const setDefaultAi = useSetDefaultAi();

  const [connectModal, setConnectModal] = useState<{
    provider: AiProvider;
    isReconnect: boolean;
  } | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState<AiProvider | null>(null);

  const configs = data?.data?.configs ?? [];
  const configByProvider = new Map(configs.map((c) => [c.provider, c]));
  const defaultConfig = configs.find((c) => c.isDefault);
  const hasAnyConnected = configs.length > 0;
  const geminiConnected = configByProvider.has('gemini');

  const { data: usageData } = useAiUsage(hasAnyConnected);
  const usage = usageData?.data?.usage;

  const submitConnect = (apiKey: string) => {
    if (!connectModal) return;
    const { provider } = connectModal;
    connectAi.mutate(
      { apiKey, provider },
      {
        onSuccess: () => {
          toast.success(`${AI_PROVIDER_INFO[provider].label} connected successfully`);
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

      {/* Header Banner */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
          <Zap className="w-3.5 h-3.5" />
          <span>Intelligent Multi-Provider Routing</span>
        </div>
        <h1 className="sd-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          AI Engine & Model Routing
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Link your AI providers below. Compose and autonomous Auto Run always use whichever provider
          is designated as <strong>Default</strong>. You can switch defaults at any time or assign
          channel-specific overrides in each channel's settings.
        </p>
      </div>

      {/* Provider Cards */}
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
                onSuccess: () =>
                  toast.success(`${AI_PROVIDER_INFO[provider].label} is now your default AI engine`),
                onError: (e: Error) => toast.error(e.message),
              })
            }
            settingDefault={setDefaultAi.isPending}
          />
        ))}
      </div>

      {/* Dedicated Gemini Quota & Rate Limit Advisor */}
      <GeminiRateLimitAdvisor
        lastError={usage?.lastError ?? null}
        geminiConnected={geminiConnected}
      />

      {/* Real-time Usage & Telemetry Stats */}
      {hasAnyConnected && usage && (
        <div className="sd-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Call Volume & Telemetry
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregated activity across all linked providers
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Telemetry Active</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-semibold text-slate-400">Calls Last Hour</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1 leading-none">
                {usage.callsLastHour}
              </p>
              <p className="text-[11px] text-slate-400 mt-1.5">recent requests</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-semibold text-slate-400">Calls Last 24 Hours</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1 leading-none">
                {usage.callsLast24h}
              </p>
              <p className="text-[11px] text-slate-400 mt-1.5">daily throughput</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-semibold text-slate-400">Default Engine</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="sd-badge bg-indigo-50 text-indigo-700 border-indigo-200">
                  <Check className="w-3 h-3 text-emerald-500" />
                  {defaultConfig ? AI_PROVIDER_INFO[defaultConfig.provider].label : 'None'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Last call: {usage.lastCallAt ? new Date(usage.lastCallAt).toLocaleTimeString() : 'None'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

