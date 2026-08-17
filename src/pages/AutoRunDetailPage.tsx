import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'glintly-ui';
import { ArrowLeft, Trash2, X, Loader2, Play, Clock } from 'lucide-react';
import {
  useAutoRun,
  useAiContexts,
  useUpdateAiContext,
  useDeleteAiContext,
  useUpdateAutoRun,
  useRunAutoNow,
  useConnections,
  useSetConnectionContexts,
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
  contextName,
  connectionCount,
  onClose,
  onConfirm,
  pending,
}: {
  open: boolean;
  contextName: string;
  connectionCount: number;
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-semibold text-gray-900">Delete "{contextName}"?</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {connectionCount > 0
            ? `${connectionCount} connection${connectionCount === 1 ? '' : 's'} using this context will be unassigned. `
            : ''}
          Its Auto Run schedule will be removed. This can&apos;t be undone.
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

export default function AutoRunDetailPage() {
  const { contextId = '' } = useParams();
  const navigate = useNavigate();

  const { data: contextsData } = useAiContexts();
  const { data: autoRunData, isLoading } = useAutoRun();
  const { data: connectionsData } = useConnections();
  const updateContext = useUpdateAiContext();
  const deleteContext = useDeleteAiContext();
  const updateAuto = useUpdateAutoRun(contextId);
  const runNow = useRunAutoNow(contextId);
  const setConnectionContexts = useSetConnectionContexts();

  const context = contextsData?.data?.contexts.find((c) => c.id === contextId);
  const auto = autoRunData?.data?.autoRuns.find((a) => a.contextId === contextId);
  const intervalOptions = autoRunData?.data?.intervalOptions ?? [1, 2, 3, 4, 6, 8, 12, 24];
  const connections = (connectionsData?.data?.connections ?? []).filter(
    (c) => c.status === 'connected',
  );

  const toggleConnection = (connectionId: string, currentIds: string[]) => {
    const nextIds = currentIds.includes(contextId)
      ? currentIds.filter((id) => id !== contextId)
      : [...currentIds, contextId];
    setConnectionContexts.mutate(
      { id: connectionId, contextIds: nextIds },
      { onError: (e: Error) => toast.error(e.message) },
    );
  };

  const [showDelete, setShowDelete] = useState(false);
  const [enabled, setEnabled] = useState(false);

  // Briefing fields
  const [name, setName] = useState('');
  const [aboutYou, setAboutYou] = useState('');
  const [goals, setGoals] = useState('');
  const [references, setReferences] = useState('');
  const [voice, setVoice] = useState('');
  const [audience, setAudience] = useState('');
  const [imageStyle, setImageStyle] = useState('');

  // Schedule fields
  const [intervalHours, setIntervalHours] = useState(24);
  const [topicsText, setTopicsText] = useState('');
  const [promptHint, setPromptHint] = useState('');
  const [generateImage, setGenerateImage] = useState(false);

  useEffect(() => {
    if (!context) return;
    setName(context.name);
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

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading…</p>;
  }

  if (!auto) {
    return (
      <div className="max-w-6xl space-y-4">
        <Link to="/auto" className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Auto Run
        </Link>
        <p className="text-sm text-gray-400">Context not found.</p>
      </div>
    );
  }

  const saveAll = (nextEnabled?: boolean) => {
    const willEnable = nextEnabled ?? enabled;
    if (willEnable && auto.connectionCount === 0) {
      toast.error('Assign a connected platform to this context first');
      return;
    }
    updateContext.mutate(
      { id: contextId, name, aboutYou, goals, references, voice, audience, imageStyle },
      {
        onSuccess: () => {
          updateAuto.mutate(
            { enabled: willEnable, intervalHours, topicsText, promptHint, generateImage },
            {
              onSuccess: (res) =>
                toast.success(res.data.auto.enabled ? 'Auto Run is ON' : 'Saved'),
              onError: (e: Error) => {
                if (nextEnabled !== undefined) setEnabled(!willEnable);
                toast.error(e.message);
              },
            },
          );
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const onToggle = () => {
    const next = !enabled;
    if (next && auto.connectionCount === 0) {
      toast.error('Assign a connected platform to this context first');
      return;
    }
    setEnabled(next);
    saveAll(next);
  };

  const saving = updateContext.isPending || updateAuto.isPending;

  const confirmDelete = () => {
    deleteContext.mutate(contextId, {
      onSuccess: (res) => {
        toast.success(
          res.data.unassignedConnections > 0
            ? `Deleted — ${res.data.unassignedConnections} connection(s) unassigned`
            : 'AI context deleted',
        );
        navigate('/auto');
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  return (
    <div className="max-w-6xl space-y-6">
      <ConfirmDeleteModal
        open={showDelete}
        contextName={auto.contextName}
        connectionCount={auto.connectionCount}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        pending={deleteContext.isPending}
      />

      <div className="flex items-center justify-between gap-3">
        <Link to="/auto" className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Auto Run
        </Link>
        <button
          type="button"
          onClick={() => setShowDelete(true)}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete context
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="sd-display text-xl font-bold">{auto.contextName}</h1>
          <p className="text-xs text-[var(--sd-muted)] mt-0.5">
            {enabled
              ? `Auto Run is on · next check around ${formatWhen(auto.nextRunAt)}`
              : 'Auto Run is off — turn on to start the schedule'}
          </p>
        </div>
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

      <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
      <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-5 space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">Connections</p>
          {connections.length === 0 ? (
            <p className="text-xs text-gray-400">
              No connected platforms yet.{' '}
              <Link to="/connections" className="text-purple-600 hover:underline">
                Connect one
              </Link>
              .
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {connections.map((c) => {
                const active = c.contextIds.includes(contextId);
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-[11px] text-gray-500 capitalize">
                        {c.type.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={active}
                      onClick={() => toggleConnection(c.id, c.contextIds)}
                      disabled={setConnectionContexts.isPending}
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                        active ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          active ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {auto.connectionCount === 0 && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Turn on at least one connection above before enabling Auto Run.
            </p>
          )}
        </div>

        <label className="block">
          <span className="text-xs font-medium text-gray-600">Context name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Personal brand, Company voice"
            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          />
        </label>

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
              placeholder="e.g. Grow Community following, share learning notes, promote my SaaS…"
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
            runNow.mutate(undefined, {
              onSuccess: () => toast.success('Generated and published'),
              onError: (e: Error) => toast.error(e.message),
            })
          }
          disabled={runNow.isPending || auto.connectionCount === 0}
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
      </div>
    </div>
  );
}
