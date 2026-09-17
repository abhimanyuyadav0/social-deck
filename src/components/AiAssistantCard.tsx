import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAiConfigs } from '@/api/services/socialDeck';
import { AI_PROVIDER_INFO } from '@/components/ai/providerMeta';

/** Global — AI powers drafts/images across every platform, so it doesn't belong on any one page.
 * Full connect/disconnect/default-provider management lives on the dedicated AI Models page. */
export default function AiAssistantCard() {
  const { data } = useAiConfigs();
  const configs = data?.data?.configs ?? [];
  const defaultConfig = configs.find((c) => c.isDefault) ?? configs[0];

  return (
    <Link
      to="/ai-models"
      className="sd-card sd-card-link flex items-center gap-3.5 p-4 sm:p-5"
      style={{ borderColor: '#e9d5ff', background: 'linear-gradient(135deg, #faf5ff 0%, #fdf4ff 100%)' }}
    >
      <div
        className="sd-icon-badge w-11 h-11 text-white shrink-0"
        style={{ background: 'var(--sd-accent-grad)', boxShadow: '0 6px 16px -6px rgba(147,51,234,0.45)' }}
      >
        <Sparkles className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[var(--sd-ink)]">AI Models</p>
        <p className="text-xs text-[var(--sd-muted)] mt-0.5">
          {configs.length === 0
            ? 'Connect OpenAI, Gemini, or Claude to power drafts and images.'
            : `${configs.length} provider${configs.length === 1 ? '' : 's'} linked${
                defaultConfig ? ` · ${AI_PROVIDER_INFO[defaultConfig.provider].label} is default` : ''
              }`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {configs.length === 0 ? (
          <span className="sd-btn sd-btn-primary px-3.5 py-2 text-xs">Connect</span>
        ) : (
          <span className="sd-badge bg-emerald-100 text-emerald-800">Connected</span>
        )}
        <ArrowRight className="w-4 h-4 text-[var(--sd-subtle)]" />
      </div>
    </Link>
  );
}
