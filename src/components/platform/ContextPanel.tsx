import { useEffect, useState } from 'react';
import { toast } from 'glintly-ui';
import { Trash2, X, Loader2, Play, Clock } from 'lucide-react';
import {
  type Connection,
  useAiContexts,
  useCreateAiContext,
  useUpdateAiContext,
  useDeleteAiContext,
  useAutoRun,
  useUpdateAutoRun,
  useRunAutoNow,
  useSetConnectionContext,
} from '@/api/services/socialDeck';
import AutoResizeTextarea from '@/components/AutoResizeTextarea';

const IMAGE_STYLES = [
  'Flat vector illustration',
  'Photorealistic',
  'Minimal geometric',
  '3D render',
  'Hand-drawn sketch',
  'Cinematic dark',
];

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

function ConfirmDeleteModal({
  open,
  connectionName,
  onClose,
  onConfirm,
  pending,
}: {
  open: boolean;
  connectionName: string;
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-semibold text-gray-900">Delete {connectionName}&apos;s briefing?</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Its Auto Run schedule will be removed too. This can&apos;t be undone.
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
            {pending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Briefing (who-you-are/goals/voice/etc) + Auto Run schedule for exactly this one connection. */
export default function ContextPanel({ connection }: { connection: Connection }) {
  const { data: contextsData } = useAiContexts();
  const { data: autoRunData, isLoading } = useAutoRun();
  const createContext = useCreateAiContext();
  const updateContext = useUpdateAiContext();
  const deleteContext = useDeleteAiContext();
  const setConnectionContext = useSetConnectionContext();
  const updateAuto = useUpdateAutoRun();
  const runNow = useRunAutoNow();

  const context = connection.contextId
    ? contextsData?.data?.contexts.find((c) => c.id === connection.contextId)
    : undefined;
  const auto = connection.contextId
    ? autoRunData?.data?.autoRuns.find((a) => a.contextId === connection.contextId)
    : undefined;
  const intervalOptions = autoRunData?.data?.intervalOptions ?? [1, 2, 3, 4, 6, 8, 12, 24];

  const [showDelete, setShowDelete] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const [aboutYou, setAboutYou] = useState('');
  const [goals, setGoals] = useState('');
  const [references, setReferences] = useState('');
  const [voice, setVoice] = useState('');
  const [audience, setAudience] = useState('');
  const [imageStyle, setImageStyle] = useState('');

  const [intervalHours, setIntervalHours] = useState(24);
  const [topicsText, setTopicsText] = useState('');
  const [promptHint, setPromptHint] = useState('');
  const [generateImage, setGenerateImage] = useState(false);

  useEffect(() => {
    if (!context) return;
    setAboutYou(context.aboutYou);
    setGoals(context.goals);
    setReferences(context.references);
    setVoice(context.voice);
    setAudience(context.audience);
    setImageStyle(context.imageStyle || '');
  }, [context]);

  useEffect(() => {
    if (!auto) return;
    setEnabled(auto.enabled);
    setIntervalHours(auto.intervalHours);
    setTopicsText((auto.topics || []).join('\n'));
    setPromptHint(auto.promptHint || '');
    setGenerateImage(!!auto.generateImage);
  }, [auto]);

  const saving =
    createContext.isPending ||
    updateContext.isPending ||
    updateAuto.isPending ||
    setConnectionContext.isPending;

  const saveScheduleFor = (contextIdToUse: string, willEnable: boolean) => {
    updateAuto.mutate(
      { contextId: contextIdToUse, enabled: willEnable, intervalHours, topicsText, promptHint, generateImage },
      {
        onSuccess: (res) => toast.success(res.data.auto.enabled ? 'Auto Run is ON' : 'Saved'),
        onError: (e: Error) => {
          if (willEnable) setEnabled(false);
          toast.error(e.message);
        },
      },
    );
  };

  const saveAll = (nextEnabled?: boolean) => {
    const willEnable = nextEnabled ?? enabled;
    const briefingFields = { aboutYou, goals, references, voice, audience, imageStyle };

    if (connection.contextId) {
      updateContext.mutate(
        { id: connection.contextId, ...briefingFields },
        {
          onSuccess: () => saveScheduleFor(connection.contextId as string, willEnable),
          onError: (e: Error) => toast.error(e.message),
        },
      );
      return;
    }

    // First save for this connection — create its dedicated context and assign it in one go.
    createContext.mutate(
      { name: `${connection.name} context`, ...briefingFields },
      {
        onSuccess: (res) => {
          const newContextId = res.data.context.id;
          setConnectionContext.mutate(
            { id: connection.id, contextId: newContextId },
            {
              onSuccess: () => saveScheduleFor(newContextId, willEnable),
              onError: (e: Error) => toast.error(e.message),
            },
          );
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const onToggle = () => {
    const next = !enabled;
    setEnabled(next);
    saveAll(next);
  };

  const confirmDelete = () => {
    if (!connection.contextId) return;
    deleteContext.mutate(connection.contextId, {
      onSuccess: () => {
        toast.success('Briefing deleted');
        setShowDelete(false);
        setAboutYou('');
        setGoals('');
        setReferences('');
        setVoice('');
        setAudience('');
        setImageStyle('');
        setEnabled(false);
        setIntervalHours(24);
        setTopicsText('');
        setPromptHint('');
        setGenerateImage(false);
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <ConfirmDeleteModal
        open={showDelete}
        connectionName={connection.name}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        pending={deleteContext.isPending}
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="sd-display text-lg font-bold">Briefing & Auto Run</h2>
          <p className="text-xs text-[var(--sd-muted)] mt-0.5">
            {enabled
              ? `Auto Run is on${auto?.nextRunAt ? ` · next check around ${formatWhen(auto.nextRunAt)}` : ''}`
              : 'Auto Run is off — turn on to start the schedule'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {connection.contextId && (
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={onToggle}
            disabled={saving}
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
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
        <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-5 space-y-4">
          <div className="space-y-2">
            <label className="block">
              <span className="text-xs font-medium text-gray-600">Who you are</span>
              <AutoResizeTextarea
                value={aboutYou}
                onChange={(e) => setAboutYou(e.target.value)}
                placeholder="e.g. Full-stack developer at Acme, 5 yrs React/Node, building in public…"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-600">What you&apos;re trying to accomplish</span>
              <AutoResizeTextarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g. Grow following, share learning notes, promote my SaaS…"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-600">References</span>
              <AutoResizeTextarea
                rows={3}
                value={references}
                onChange={(e) => setReferences(e.target.value)}
                placeholder="Links, projects, stats, talking points — one per line&#10;https://myapp.com&#10;Shipped v2 last week with 40% faster builds"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-mono text-[13px]"
              />
            </label>
            <div className="grid sm:grid-cols-2 gap-2">
              <label className="block">
                <span className="text-xs font-medium text-gray-600">Voice / tone</span>
                <input
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  placeholder="Friendly, direct, no jargon"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-600">Audience</span>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Developers, founders, students…"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-violet-100">
            <label className="block">
              <span className="text-xs font-medium text-gray-600">Topics</span>
              <p className="text-[11px] text-[var(--sd-muted)] mt-0.5 mb-1">
                One theme per line. Auto Run rotates through these so posts stay varied.
              </p>
              <AutoResizeTextarea
                rows={3}
                value={topicsText}
                onChange={(e) => setTopicsText(e.target.value)}
                placeholder={'Developer productivity tips\nLessons from shipping features\nCommunity building'}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-600">Standing instructions</span>
              <AutoResizeTextarea
                value={promptHint}
                onChange={(e) => setPromptHint(e.target.value)}
                placeholder="e.g. Keep under 400 words, end with a question"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
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
                Include 1–4 AI images (picked at random) with each Auto Run post (OpenAI Images +
                Cloudinary; billed to your OpenAI account).
              </span>
            </label>

            {generateImage && (
              <label className="block pl-6">
                <span className="text-xs font-medium text-gray-600">Image context</span>
                <p className="text-[11px] text-[var(--sd-muted)] mt-0.5 mb-1">
                  Describe what the image should look like — AI considers this when generating it.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {IMAGE_STYLES.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setImageStyle((prev) => (prev === style ? '' : style))}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                        imageStyle === style
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-violet-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
                <AutoResizeTextarea
                  value={imageStyle}
                  onChange={(e) => setImageStyle(e.target.value)}
                  placeholder="e.g. Flat vector illustration, purple and white, no people, clean workspace scene"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </label>
            )}
          </div>

          <div className="space-y-2 pt-1 border-t border-violet-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <p className="font-semibold text-sm">Post gap</p>
            </div>
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

          <button
            type="button"
            onClick={() => saveAll()}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        {auto && (
          <div className="rounded-xl border border-[var(--sd-line)] bg-gray-50 p-4 space-y-3 text-sm lg:sticky lg:top-6">
            <p className="font-semibold">Status</p>
            <dl className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-gray-500">Last run</dt>
                <dd>{formatWhen(auto.lastRunAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-gray-500">Next run</dt>
                <dd>{formatWhen(auto.nextRunAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-gray-500">Last status</dt>
                <dd className="capitalize">{auto.lastStatus || 'idle'}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-gray-500">Runs completed</dt>
                <dd>{auto.runCount ?? 0}</dd>
              </div>
            </dl>
            {auto.lastError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {auto.lastError}
              </p>
            )}
            <button
              type="button"
              onClick={() =>
                runNow.mutate(connection.contextId as string, {
                  onSuccess: () => toast.success('Generated and published'),
                  onError: (e: Error) => toast.error(e.message),
                })
              }
              disabled={runNow.isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-purple-200 bg-white text-purple-700 text-sm font-semibold hover:bg-purple-50 disabled:opacity-50"
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
        )}
      </div>
    </div>
  );
}
