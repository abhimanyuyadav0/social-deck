import { useEffect, useState } from 'react';
import { X, Eye, EyeOff, Info, ExternalLink, Loader2 } from 'lucide-react';
import type { AiProvider } from '@/api/services/socialDeck';
import { AI_PROVIDER_INFO } from './providerMeta';

export default function ConnectProviderModal({
  open,
  provider,
  isReconnect,
  onClose,
  onSubmit,
  pending,
}: {
  open: boolean;
  provider: AiProvider;
  isReconnect: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
  pending: boolean;
}) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const info = AI_PROVIDER_INFO[provider];

  useEffect(() => {
    if (open) {
      setApiKey('');
      setShowKey(false);
    }
  }, [open, provider]);

  if (!open) return null;

  return (
    <div className="sd-modal-overlay">
      <div className="sd-modal-panel w-full max-w-md p-6 space-y-4 border border-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${info.iconBg}`} />
              {isReconnect ? `Update ${info.label} API Key` : `Connect ${info.label}`}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Used solely to generate drafts, captions, and media you request. Requests authenticate
              directly to your provider account.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini Pro vs API Billing Callout */}
        {provider === 'gemini' && (
          <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-blue-800">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Have a "Gemini Pro" / Google One Subscription?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800/90">
              Google One AI Premium is for consumer chat (gemini.google.com). Developer API keys from Google AI Studio operate on the <strong>Free Tier</strong> unless you enable <strong>Pay-as-you-go billing</strong> in Google AI Studio.
            </p>
            <a
              href="https://aistudio.google.com/app/plan_information"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline pt-0.5"
            >
              Set up Pay-as-you-go in AI Studio
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {info.label} API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={info.keyPlaceholder}
              className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-mono text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Get an API key from{' '}
            <a
              href={info.helpUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 font-semibold hover:underline"
            >
              {info.helpLabel}
            </a>
            .
          </p>
        </div>

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
            disabled={pending || !info.looksValid(apiKey)}
            onClick={() => onSubmit(apiKey.trim())}
            className="sd-btn sd-btn-primary px-5 py-2 text-xs"
          >
            {pending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying…</span>
              </>
            ) : isReconnect ? (
              'Update key'
            ) : (
              `Connect ${info.label}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

