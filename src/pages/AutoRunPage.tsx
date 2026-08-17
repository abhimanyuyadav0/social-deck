import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'glintly-ui';
import { Bot, Plus, ChevronRight } from 'lucide-react';
import { useAutoRun, useCreateAiContext } from '@/api/services/socialDeck';
import AiContextForm, { type AiContextValues } from '@/components/AiContextForm';

function formatWhen(iso?: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AutoRunPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useAutoRun();
  const createContext = useCreateAiContext();
  const [creating, setCreating] = useState(false);

  const autoRuns = data?.data?.autoRuns ?? [];

  const submitCreate = (values: AiContextValues) => {
    createContext.mutate(values, {
      onSuccess: (res) => {
        toast.success('AI context created');
        setCreating(false);
        navigate(`/auto/${res.data.context.id}`);
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="sd-display text-xl font-bold flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" />
            Auto Run
          </h1>
          <p className="text-sm text-[var(--sd-muted)] mt-1">
            Create an AI context, assign connections to it on{' '}
            <Link to="/connections" className="text-purple-600 hover:underline">
              Connections
            </Link>
            , then open it here to configure its schedule. Each context runs independently.
          </p>
        </div>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold shrink-0"
          >
            <Plus className="w-4 h-4" />
            New context
          </button>
        )}
      </div>

      {creating && (
        <AiContextForm
          onSave={submitCreate}
          onCancel={() => setCreating(false)}
          pending={createContext.isPending}
        />
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : autoRuns.length === 0 && !creating ? (
        <div className="rounded-xl border border-dashed border-purple-200 p-6 text-center text-sm text-[var(--sd-muted)]">
          No AI contexts yet. Create one to start writing with AI and scheduling Auto Run.
        </div>
      ) : (
        <div className="space-y-2">
          {autoRuns.map((auto) => (
            <Link
              key={auto.contextId}
              to={`/auto/${auto.contextId}`}
              className="flex items-center justify-between gap-3 p-4 rounded-xl border border-[var(--sd-line)] bg-white hover:border-purple-300 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-semibold text-sm">{auto.contextName}</p>
                <p className="text-xs text-[var(--sd-muted)] mt-0.5">
                  {auto.connectionCount} connection{auto.connectionCount === 1 ? '' : 's'} ·{' '}
                  {auto.enabled ? `On · next check ${formatWhen(auto.nextRunAt)}` : 'Off'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`w-2 h-2 rounded-full ${auto.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
                />
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
