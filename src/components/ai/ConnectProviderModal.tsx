import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
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
  /** Updating an already-connected key vs. linking it for the first time — just changes copy. */
  isReconnect: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
  pending: boolean;
}) {
  const [apiKey, setApiKey] = useState('');
  const info = AI_PROVIDER_INFO[provider];

  useEffect(() => {
    if (open) setApiKey('');
  }, [open, provider]);

  if (!open) return null;

  return (
    <div className="sd-modal-overlay">
      <div className="sd-modal-panel w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-[var(--sd-ink)]">
              {isReconnect ? `Update ${info.label} key` : `Connect ${info.label}`}
            </h2>
            <p className="text-xs text-[var(--sd-muted)] mt-1 leading-relaxed">
              Used only to generate drafts you ask for — billing stays on your own {info.label}{' '}
              account.
            </p>
          </div>
          <button type="button" onClick={onClose} className="sd-btn sd-btn-ghost p-1.5 shrink-0" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--sd-muted)] mb-1">{info.label} API key</label>
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={info.keyPlaceholder}
            className="w-full px-3 py-2 rounded-xl border border-[var(--sd-line-soft)] bg-[var(--sd-surface-alt)] text-sm font-mono focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-colors"
          />
          <p className="text-[11px] text-[var(--sd-subtle)] mt-1">
            Get a key from{' '}
            <a href={info.helpUrl} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">
              {info.helpLabel}
            </a>
            .
          </p>
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="sd-btn sd-btn-secondary px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            disabled={pending || !info.looksValid(apiKey)}
            onClick={() => onSubmit(apiKey.trim())}
            className="sd-btn sd-btn-primary px-4 py-2 text-sm"
          >
            {pending ? 'Connecting…' : isReconnect ? 'Update key' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  );
}
