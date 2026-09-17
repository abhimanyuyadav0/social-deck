import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'glintly-ui';
import { Type, Image as ImageIcon, Video, ArrowRight } from 'lucide-react';
import {
  type Connection,
  type AiProvider,
  type AiProviderChoice,
  useAiConfigs,
  useAiContexts,
  useCreateAiContext,
  useUpdateAiContext,
  useSetConnectionContext,
} from '@/api/services/socialDeck';
import { AI_PROVIDER_INFO } from '@/components/ai/providerMeta';

const TEXT_PROVIDER_OPTIONS: AiProviderChoice[] = ['default', 'openai', 'gemini', 'claude'];
const IMAGE_PROVIDER_OPTIONS: Exclude<AiProviderChoice, 'claude'>[] = ['default', 'openai', 'gemini'];

const DEFAULT_MODEL_HINT: Record<AiProvider, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-3.6-flash',
  claude: 'claude-sonnet-5',
};

function ProviderPicker({
  value,
  options,
  onChange,
  connectedSet,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  connectedSet: Set<AiProvider>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isDefault = opt === 'default';
        const label = isDefault ? 'Default' : AI_PROVIDER_INFO[opt as AiProvider].label;
        const connected = isDefault || connectedSet.has(opt as AiProvider);
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
              active
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white border-[var(--sd-line-soft)] text-[var(--sd-muted)] hover:border-purple-300'
            }`}
          >
            {label}
            {!connected && (
              <span className={`text-[10px] ${active ? 'text-white/75' : 'text-amber-500'}`}>not connected</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function AiSettingsPanel({ connection }: { connection: Connection }) {
  const { data: contextsData } = useAiContexts();
  const { data: aiConfigsData } = useAiConfigs();
  const createContext = useCreateAiContext();
  const updateContext = useUpdateAiContext();
  const setConnectionContext = useSetConnectionContext();

  const context = connection.contextId
    ? contextsData?.data?.contexts.find((c) => c.id === connection.contextId)
    : undefined;

  const configs = aiConfigsData?.data?.configs ?? [];
  const connectedSet = new Set(configs.map((c) => c.provider));
  const defaultConfig = configs.find((c) => c.isDefault);
  const geminiConnected = connectedSet.has('gemini');

  const [textProvider, setTextProvider] = useState<AiProviderChoice>('default');
  const [textModel, setTextModel] = useState('');
  const [imageProvider, setImageProvider] = useState<Exclude<AiProviderChoice, 'claude'>>('default');

  useEffect(() => {
    if (!context) return;
    setTextProvider((context.textProvider as AiProviderChoice) || 'default');
    setTextModel(context.textModel || '');
    setImageProvider((context.imageProvider as Exclude<AiProviderChoice, 'claude'>) || 'default');
  }, [context]);

  const saving = createContext.isPending || updateContext.isPending || setConnectionContext.isPending;

  const saveAll = () => {
    const fields = { textProvider, textModel: textModel.trim(), imageProvider };

    if (connection.contextId) {
      updateContext.mutate(
        { id: connection.contextId, ...fields },
        {
          onSuccess: () => toast.success('AI settings saved'),
          onError: (e: Error) => toast.error(e.message),
        },
      );
      return;
    }

    // First save for this connection — create its dedicated context and assign it in one go
    // (same pattern the Briefing tab uses).
    createContext.mutate(
      { name: `${connection.name} context`, ...fields },
      {
        onSuccess: (res) => {
          setConnectionContext.mutate(
            { id: connection.id, contextId: res.data.context.id },
            {
              onSuccess: () => toast.success('AI settings saved'),
              onError: (e: Error) => toast.error(e.message),
            },
          );
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const resolvedTextLabel =
    textProvider === 'default'
      ? defaultConfig
        ? AI_PROVIDER_INFO[defaultConfig.provider].label
        : 'nothing connected yet'
      : AI_PROVIDER_INFO[textProvider as AiProvider].label;

  const resolvedImageLabel =
    imageProvider === 'default'
      ? defaultConfig
        ? AI_PROVIDER_INFO[defaultConfig.provider].label
        : 'nothing connected yet'
      : AI_PROVIDER_INFO[imageProvider as AiProvider].label;

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="sd-display text-lg font-bold text-[var(--sd-ink)]">AI Settings</h2>
        <p className="text-xs text-[var(--sd-muted)] mt-0.5">
          Choose which linked AI generates text and images for this connection — independent of
          your{' '}
          <Link to="/ai-models" className="text-purple-600 hover:underline">
            AI Models
          </Link>{' '}
          default.
        </p>
      </div>

      <div className="sd-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="sd-icon-badge w-9 h-9 bg-purple-50 text-purple-700">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[var(--sd-ink)]">Text generation</p>
            <p className="text-xs text-[var(--sd-subtle)]">Uses {resolvedTextLabel}</p>
          </div>
        </div>
        <ProviderPicker
          value={textProvider}
          options={TEXT_PROVIDER_OPTIONS}
          onChange={(v) => setTextProvider(v as AiProviderChoice)}
          connectedSet={connectedSet}
        />
        <div>
          <label className="block text-xs font-medium text-[var(--sd-muted)] mb-1">
            Model <span className="text-[var(--sd-subtle)] font-normal">(optional)</span>
          </label>
          <input
            value={textModel}
            onChange={(e) => setTextModel(e.target.value)}
            placeholder={
              textProvider === 'default'
                ? defaultConfig
                  ? DEFAULT_MODEL_HINT[defaultConfig.provider]
                  : 'e.g. gpt-4o-mini'
                : DEFAULT_MODEL_HINT[textProvider as AiProvider]
            }
            className="w-full px-3 py-2 rounded-xl border border-[var(--sd-line-soft)] bg-white text-sm font-mono focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-colors"
          />
          <p className="text-[11px] text-[var(--sd-subtle)] mt-1">
            Leave blank to use that provider&apos;s own default model.
          </p>
        </div>
      </div>

      <div className="sd-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="sd-icon-badge w-9 h-9 bg-blue-50 text-blue-700">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[var(--sd-ink)]">Image generation</p>
            <p className="text-xs text-[var(--sd-subtle)]">Uses {resolvedImageLabel}</p>
          </div>
        </div>
        <ProviderPicker
          value={imageProvider}
          options={IMAGE_PROVIDER_OPTIONS}
          onChange={(v) => setImageProvider(v as Exclude<AiProviderChoice, 'claude'>)}
          connectedSet={connectedSet}
        />
        <p className="text-[11px] text-[var(--sd-subtle)]">
          Claude can&apos;t generate images, so it isn&apos;t offered here. Pick which image model
          (e.g. Nano Banana variant) in the <strong>Briefing &amp; Auto Run</strong> tab&apos;s Media
          section, once one of these providers is connected.
        </p>
      </div>

      <div className="sd-card p-5 space-y-2">
        <div className="flex items-center gap-2">
          <div className="sd-icon-badge w-9 h-9 bg-emerald-50 text-emerald-700">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[var(--sd-ink)]">Video generation</p>
            <p className="text-xs text-[var(--sd-subtle)]">
              {geminiConnected ? 'Gemini (Veo) is connected' : 'Gemini (Veo) — not connected'}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-[var(--sd-subtle)]">
          Veo is Gemini-only, so there&apos;s no provider to choose — just{' '}
          {geminiConnected ? (
            'keep Gemini connected'
          ) : (
            <Link to="/ai-models" className="text-purple-600 hover:underline inline-flex items-center gap-0.5">
              connect Gemini on AI Models
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
          . Pick the Veo model and clip length in the <strong>Briefing &amp; Auto Run</strong> tab&apos;s
          Media section.
        </p>
      </div>

      <button type="button" onClick={saveAll} disabled={saving} className="sd-btn sd-btn-primary px-5 py-2.5 text-sm">
        {saving ? 'Saving…' : 'Save settings'}
      </button>
    </div>
  );
}
