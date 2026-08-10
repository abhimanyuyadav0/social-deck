import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'glintly-ui';
import { Bot, Loader2, Play, Clock } from 'lucide-react';
import {
  useAutoRun,
  useUpdateAutoRun,
  useRunAutoNow,
  useConnections,
  useAiConfig,
  useSaveAiProfile,
} from '@/api/services/socialDeck';
import AiContextForm from '@/components/AiContextForm';

function formatWhen(iso?: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function intervalLabel(hours: number) {
  if (hours === 24) return 'Every day (24 hours)';
  if (hours === 1) return 'Every 1 hour';
  return `Every ${hours} hours`;
}

export default function AutoRunPage() {
  const { data, isLoading } = useAutoRun();
  const { data: connectionsData } = useConnections();
  const { data: aiData } = useAiConfig();
  const updateAuto = useUpdateAutoRun();
  const runNow = useRunAutoNow();
  const saveAiProfile = useSaveAiProfile();

  const auto = data?.data?.auto;
  const intervalOptions = data?.data?.intervalOptions ?? [1, 2, 3, 4, 6, 8, 12, 24];
  const connections = (connectionsData?.data?.connections ?? []).filter(
    (c) => c.status === 'connected',
  );
  const hasAi = !!aiData?.data?.ai?.connected;
  const profile = aiData?.data?.profile ?? {
    aboutYou: '',
    goals: '',
    references: '',
    voice: '',
    audience: '',
  };

  const [enabled, setEnabled] = useState(false);
  const [intervalHours, setIntervalHours] = useState(24);
  const [selected, setSelected] = useState<string[]>([]);
  const [topicsText, setTopicsText] = useState('');
  const [promptHint, setPromptHint] = useState('');
  const [generateImage, setGenerateImage] = useState(false);

  useEffect(() => {
    if (!auto) return;
    setEnabled(!!auto.enabled);
    setIntervalHours(auto.intervalHours || 24);
    setSelected(auto.connectionIds || []);
    setTopicsText((auto.topics || []).join('\n'));
    setPromptHint(auto.promptHint || '');
    setGenerateImage(!!auto.generateImage);
  }, [auto]);

  const toggleConnection = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const save = (nextEnabled?: boolean) => {
    const willEnable = nextEnabled ?? enabled;
    if (willEnable && !hasAi) {
      toast.error('Connect OpenAI in Connections first');
      return;
    }
    if (willEnable && selected.length === 0) {
      toast.error('Select at least one platform to publish to');
      return;
    }
    updateAuto.mutate(
      {
        enabled: willEnable,
        intervalHours,
        connectionIds: selected,
        topicsText,
        promptHint,
        generateImage,
      },
      {
        onSuccess: (res) => {
          toast.success(
            res.data.auto.enabled
              ? 'Auto Run is ON — posts will generate on schedule'
              : 'Auto Run settings saved',
          );
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const onToggle = () => {
    const next = !enabled;
    if (next && !hasAi) {
      toast.error('Connect OpenAI in Connections first');
      return;
    }
    if (next && selected.length === 0) {
      toast.error('Select at least one platform to publish to');
      return;
    }
    setEnabled(next);
    updateAuto.mutate(
      {
        enabled: next,
        intervalHours,
        connectionIds: selected,
        topicsText,
        promptHint,
        generateImage,
      },
      {
        onSuccess: () =>
          toast.success(next ? 'Auto Run is ON' : 'Auto Run is OFF'),
        onError: (e: Error) => {
          setEnabled(!next);
          toast.error(e.message);
        },
      },
    );
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="sd-display text-xl font-bold flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-600" />
          Auto Run
        </h1>
        <p className="text-sm text-[var(--sd-muted)] mt-1">
          Fully automatic: AI generates a unique post and publishes it on a timer. Edit Your AI
          context here once — it applies to Auto Run and Compose.
        </p>
      </div>

      <AiContextForm
        initial={profile}
        pending={saveAiProfile.isPending}
        onSave={(body) =>
          saveAiProfile.mutate(body, {
            onSuccess: () => toast.success('AI context saved — used for Compose and Auto Run'),
            onError: (e: Error) => toast.error(e.message),
          })
        }
      />

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <>
          <div className="rounded-xl border border-[var(--sd-line)] bg-white p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm">Auto generate &amp; post</p>
                <p className="text-xs text-[var(--sd-muted)] mt-0.5">
                  {enabled
                    ? `Running · next check around ${formatWhen(auto?.nextRunAt)}`
                    : 'Off — turn on to start the schedule'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={onToggle}
                disabled={updateAuto.isPending}
                className={`relative w-14 h-8 rounded-full transition-colors shrink-0 ${
                  enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {!hasAi && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Connect OpenAI in{' '}
                <Link to="/connections" className="font-semibold underline">
                  Connections
                </Link>{' '}
                before enabling Auto Run.
              </p>
            )}

            {connections.length === 0 && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Connect Community in{' '}
                <Link to="/connections" className="font-semibold underline">
                  Connections
                </Link>{' '}
                so Auto Run has somewhere to publish.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--sd-line)] bg-white p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <p className="font-semibold text-sm">Post gap</p>
            </div>
            <p className="text-xs text-[var(--sd-muted)]">
              How often to generate and publish. The server checks every 15 minutes for due runs.
            </p>
            <div className="flex flex-wrap gap-2">
              {intervalOptions.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setIntervalHours(h)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    intervalHours === h
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
                  }`}
                >
                  {intervalLabel(h)}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--sd-line)] bg-white p-5 space-y-3">
            <p className="font-semibold text-sm">Publish to</p>
            {connections.length === 0 ? (
              <p className="text-xs text-gray-400">No connected platforms yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {connections.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleConnection(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selected.includes(c.id)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[var(--sd-line)] bg-white p-5 space-y-3">
            <p className="font-semibold text-sm">Topics (optional)</p>
            <p className="text-xs text-[var(--sd-muted)]">
              One theme per line. Auto Run rotates through them so posts stay varied.
            </p>
            <textarea
              rows={4}
              value={topicsText}
              onChange={(e) => setTopicsText(e.target.value)}
              placeholder={'Developer productivity tips\nLessons from shipping features\nCommunity building'}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-y"
            />
            <label className="block">
              <span className="text-xs font-medium text-gray-600">Standing instructions</span>
              <textarea
                rows={2}
                value={promptHint}
                onChange={(e) => setPromptHint(e.target.value)}
                placeholder="e.g. Keep under 400 words, end with a question"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-y"
              />
            </label>
            <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={generateImage}
                onChange={(e) => setGenerateImage(e.target.checked)}
                className="mt-0.5 rounded border-gray-300"
              />
              <span>
                Include AI image with each auto post (OpenAI Images + Cloudinary; billed to your
                OpenAI account)
              </span>
            </label>
            <button
              type="button"
              onClick={() => save()}
              disabled={updateAuto.isPending}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold disabled:opacity-50"
            >
              {updateAuto.isPending ? 'Saving…' : 'Save settings'}
            </button>
          </div>

          <div className="rounded-xl border border-[var(--sd-line)] bg-gray-50 p-5 space-y-3 text-sm">
            <p className="font-semibold">Status</p>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <dt className="text-gray-500">Last run</dt>
              <dd>{formatWhen(auto?.lastRunAt)}</dd>
              <dt className="text-gray-500">Next run</dt>
              <dd>{formatWhen(auto?.nextRunAt)}</dd>
              <dt className="text-gray-500">Last status</dt>
              <dd className="capitalize">{auto?.lastStatus || 'idle'}</dd>
              <dt className="text-gray-500">Runs completed</dt>
              <dd>{auto?.runCount ?? 0}</dd>
            </dl>
            {auto?.lastError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {auto.lastError}
              </p>
            )}
            <button
              type="button"
              onClick={() =>
                runNow.mutate(undefined, {
                  onSuccess: () => toast.success('Generated and published'),
                  onError: (e: Error) => toast.error(e.message),
                })
              }
              disabled={runNow.isPending || !hasAi || selected.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-200 bg-white text-purple-700 text-sm font-semibold hover:bg-purple-50 disabled:opacity-50"
            >
              {runNow.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run once now
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
