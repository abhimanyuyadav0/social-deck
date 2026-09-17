import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useAiConfigs } from '@/api/services/socialDeck';
import { AI_PROVIDER_INFO } from '@/components/ai/providerMeta';

export default function AiAssistantCard() {
  const { data } = useAiConfigs();
  const configs = data?.data?.configs ?? [];
  const defaultConfig = configs.find((c) => c.isDefault) ?? configs[0];

  return (
    <Link
      to="/ai-models"
      className="sd-card sd-card-link p-5 relative overflow-hidden group block border-indigo-100 hover:border-indigo-300"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #f5f3ff 100%)',
      }}
    >
      {/* Decorative subtle ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div
            className="sd-icon-badge w-12 h-12 text-white shrink-0 shadow-md group-hover:scale-105 transition-transform duration-200"
            style={{
              background: 'var(--sd-accent-grad)',
              boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.45)',
            }}
          >
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-900 tracking-tight">AI Generation Engine</span>
              {configs.length > 0 ? (
                <span className="sd-badge bg-emerald-50 text-emerald-700 border-emerald-200">
                  <span className="sd-pulse-dot bg-emerald-500" />
                  Active: {defaultConfig ? AI_PROVIDER_INFO[defaultConfig.provider].label : 'Linked'}
                </span>
              ) : (
                <span className="sd-badge bg-amber-50 text-amber-700 border-amber-200">
                  <Zap className="w-2.5 h-2.5" />
                  Not Connected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xl">
              {configs.length === 0
                ? 'Link OpenAI, Gemini, or Claude to generate autonomous briefings, captions, Nano Banana images, and Veo video.'
                : `${configs.length} provider${configs.length === 1 ? '' : 's'} linked. Auto Run & Compose use ${
                    defaultConfig ? AI_PROVIDER_INFO[defaultConfig.provider].label : 'default'
                  } as default engine.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          {configs.length === 0 ? (
            <span className="sd-btn sd-btn-primary px-4 py-2 text-xs shadow-sm">
              Connect AI Key
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
              <span>Manage Models</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

