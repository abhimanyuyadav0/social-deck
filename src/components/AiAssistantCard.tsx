import { useState } from 'react';
import { toast } from 'glintly-ui';
import { Sparkles, X } from 'lucide-react';
import { useAiConfig, useConnectAi, useDisconnectAi } from '@/api/services/socialDeck';

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
            <h2 className="font-semibold text-gray-900">Connect AI Assistant</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Paste an OpenAI API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-purple-600 hover:underline"
              >
                platform.openai.com
              </a>
              . Used only to generate drafts/images you ask for — billing stays on your OpenAI
              account.
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

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 flex items-start gap-3">
      <ConnectAiModal
        open={showModal}
        onClose={() => setShowModal(false)}
        pending={connectAi.isPending}
        onSubmit={(apiKey) =>
          connectAi.mutate(
            { apiKey },
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
        <p className="font-semibold text-sm">AI Assistant (OpenAI)</p>
        <p className="text-xs text-[var(--sd-muted)] mt-0.5">
          Powers drafts and images across every platform&apos;s Compose and Auto Run.
        </p>
        {hasAi && ai?.keyPrefix && (
          <p className="text-xs text-emerald-700 mt-1 font-mono">
            Connected · {ai.keyPrefix}… · {ai.model || 'gpt-4o-mini'}
          </p>
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
