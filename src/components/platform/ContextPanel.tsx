import { useEffect, useState } from 'react';
import { toast } from 'glintly-ui';
import { Trash2, X, Loader2, Play, Clock } from 'lucide-react';
import {
  type Connection,
  useAiConfig,
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
  if (hours > 24 && hours % 24 === 0) {
    const days = hours / 24;
    return `Every ${days} days`;
  }
  return `Every ${hours} hours`;
}

const IMAGE_MODEL_LABELS: Record<string, string> = {
  'gemini-3.1-flash-lite-image': 'Nano Banana 2 Lite (fastest, cheapest)',
  'gemini-3.1-flash-image': 'Nano Banana 2 (balanced)',
  'gemini-3-pro-image': 'Nano Banana Pro (best quality)',
};

function imageModelLabel(model: string) {
  return IMAGE_MODEL_LABELS[model] || model;
}

const VIDEO_MODEL_LABELS: Record<string, string> = {
  'veo-3.1-generate-preview': 'Veo 3.1 (best quality)',
  'veo-3.1-fast-generate-preview': 'Veo 3.1 Fast (cheaper, quicker)',
  'veo-3.1-lite-generate-preview': 'Veo 3.1 Lite (cheapest)',
};

function videoModelLabel(model: string) {
  return VIDEO_MODEL_LABELS[model] || model;
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
    <div className="sd-modal-overlay">
      <div className="sd-modal-panel w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-bold text-[var(--sd-ink)]">Delete {connectionName}&apos;s briefing?</h2>
          <button type="button" onClick={onClose} className="sd-btn sd-btn-ghost p-1.5 shrink-0" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-[var(--sd-muted)] leading-relaxed">
          Its Auto Run schedule will be removed too. This can&apos;t be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="sd-btn sd-btn-secondary px-4 py-2 text-sm">
            Cancel
          </button>
          <button type="button" disabled={pending} onClick={onConfirm} className="sd-btn sd-btn-danger px-4 py-2 text-sm">
            {pending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Briefing (who-you-are/goals/voice/etc) + Auto Run schedule for exactly this one connection. */
export default function ContextPanel({ connection }: { connection: Connection }) {
  const { data: aiData } = useAiConfig();
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
  const intervalOptions = Array.from(
    new Set([
      ...(autoRunData?.data?.intervalOptions ?? [1, 2, 3, 4, 6, 8, 12, 24]),
      72,
      144,
      240,
    ]),
  ).sort((a, b) => a - b);
  const imageModelOptions = autoRunData?.data?.imageModelOptions ?? [
    'gemini-3.1-flash-lite-image',
    'gemini-3.1-flash-image',
    'gemini-3-pro-image',
  ];
  const videoModelOptions = autoRunData?.data?.videoModelOptions ?? [
    'veo-3.1-generate-preview',
    'veo-3.1-fast-generate-preview',
    'veo-3.1-lite-generate-preview',
  ];
  const videoDurationOptions = autoRunData?.data?.videoDurationOptions ?? [8, 15, 22, 29];
  const ai = aiData?.data?.ai;
  const isGeminiAi = ai?.provider === 'gemini';
  const canGenerateVideo = connection.type === 'instagram' || connection.type === 'facebook';

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
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video'>('none');
  const [durationSeconds, setDurationSeconds] = useState(8);
  const [imageModel, setImageModel] = useState('gemini-3.1-flash-lite-image');
  const [videoModel, setVideoModel] = useState('veo-3.1-generate-preview');

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
    setMediaType(auto.mediaType || 'none');
    setDurationSeconds(auto.durationSeconds || 8);
    setImageModel(auto.imageModel || 'gemini-3.1-flash-lite-image');
    setVideoModel(auto.videoModel || 'veo-3.1-generate-preview');
  }, [auto]);

  const saving =
    createContext.isPending ||
    updateContext.isPending ||
    updateAuto.isPending ||
    setConnectionContext.isPending;

  const saveScheduleFor = (contextIdToUse: string, willEnable: boolean) => {
    updateAuto.mutate(
      {
        contextId: contextIdToUse,
        enabled: willEnable,
        intervalHours,
        topicsText,
        promptHint,
        mediaType,
        ...(mediaType === 'image' ? { imageModel } : {}),
        ...(mediaType === 'video' ? { durationSeconds, videoModel } : {}),
      },
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
        setMediaType('none');
        setDurationSeconds(8);
        setImageModel('gemini-3.1-flash-lite-image');
        setVideoModel('veo-3.1-generate-preview');
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="sd-skeleton h-6 w-56" />
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          <div className="sd-skeleton h-72" />
          <div className="sd-skeleton h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ConfirmDeleteModal
        open={showDelete}
        connectionName={connection.name}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        pending={deleteContext.isPending}
      />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="sd-display text-lg font-bold text-[var(--sd-ink)]">Briefing & Auto Run</h2>
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
              className="inline-flex items-center gap-1.5 text-xs text-[var(--sd-subtle)] hover:text-red-600"
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
            className="relative w-14 h-8 rounded-full transition-colors shrink-0"
            style={{ background: enabled ? 'var(--sd-accent-grad)' : '#e5e0eb' }}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5 items-start">
        <div className="sd-card p-5 sm:p-6 space-y-5" style={{ borderColor: '#e9d5ff', background: 'linear-gradient(180deg, #faf5ff 0%, #ffffff 40%)' }}>
          <div className="space-y-2">
            <label className="block">
              <span className="text-xs font-medium text-[var(--sd-muted)]">Who you are</span>
              <AutoResizeTextarea
                value={aboutYou}
                onChange={(e) => setAboutYou(e.target.value)}
                placeholder="e.g. Full-stack developer at Acme, 5 yrs React/Node, building in public…"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-[var(--sd-line-soft)] bg-white text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-colors"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--sd-muted)]">What you&apos;re trying to accomplish</span>
              <AutoResizeTextarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g. Grow following, share learning notes, promote my SaaS…"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-[var(--sd-line-soft)] bg-white text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-colors"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--sd-muted)]">References</span>
              <AutoResizeTextarea
                rows={3}
                value={references}
                onChange={(e) => setReferences(e.target.value)}
                placeholder="Links, projects, stats, talking points — one per line&#10;https://myapp.com&#10;Shipped v2 last week with 40% faster builds"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-[var(--sd-line-soft)] bg-white text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-colors font-mono text-[13px]"
              />
            </label>
            <div className="grid sm:grid-cols-2 gap-2">
              <label className="block">
                <span className="text-xs font-medium text-[var(--sd-muted)]">Voice / tone</span>
                <input
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  placeholder="Friendly, direct, no jargon"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-[var(--sd-line-soft)] bg-white text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-colors"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-[var(--sd-muted)]">Audience</span>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Developers, founders, students…"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-[var(--sd-line-soft)] bg-white text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-colors"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-[var(--sd-line-soft)]">
            <label className="block">
              <span className="text-xs font-medium text-[var(--sd-muted)]">Topics</span>
              <p className="text-[11px] text-[var(--sd-muted)] mt-0.5 mb-1">
                One theme per line. Auto Run rotates through these so posts stay varied.
              </p>
              <AutoResizeTextarea
                rows={3}
                value={topicsText}
                onChange={(e) => setTopicsText(e.target.value)}
                placeholder={'Developer productivity tips\nLessons from shipping features\nCommunity building'}
                className="w-full px-3 py-2 rounded-xl border border-[var(--sd-line-soft)] bg-white text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-colors"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--sd-muted)]">Standing instructions</span>
              <AutoResizeTextarea
                value={promptHint}
                onChange={(e) => setPromptHint(e.target.value)}
                placeholder="e.g. Keep under 400 words, end with a question"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-[var(--sd-line-soft)] bg-white text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-colors"
              />
            </label>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[var(--sd-muted)]">Media with each Auto Run post:</p>
              <div className="flex flex-wrap gap-3 text-xs text-[var(--sd-muted)]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="auto-media-type"
                    checked={mediaType === 'none'}
                    onChange={() => setMediaType('none')}
                    className="border-[var(--sd-line)]"
                  />
                  None
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="auto-media-type"
                    checked={mediaType === 'image'}
                    onChange={() => setMediaType('image')}
                    className="border-[var(--sd-line)]"
                  />
                  Image (1–4, random)
                </label>
                <label
                  className={`flex items-center gap-1.5 ${!canGenerateVideo || !isGeminiAi ? 'opacity-50' : 'cursor-pointer'}`}
                  title={
                    !canGenerateVideo
                      ? 'Video currently publishes to Instagram Reels or Facebook Page video only'
                      : !isGeminiAi
                        ? 'Video generation needs a Gemini connection — it uses Veo.'
                        : ''
                  }
                >
                  <input
                    type="radio"
                    name="auto-media-type"
                    checked={mediaType === 'video'}
                    disabled={!canGenerateVideo || !isGeminiAi}
                    onChange={() => setMediaType('video')}
                    className="border-[var(--sd-line)]"
                  />
                  Video (Reel / Page video)
                </label>
              </div>
              {mediaType === 'image' && (
                <div className="flex items-center gap-2 pt-1">
                  <label className="text-xs text-[var(--sd-muted)]">Model:</label>
                  <select
                    value={imageModel}
                    onChange={(e) => setImageModel(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-[var(--sd-line-soft)] bg-white text-xs"
                  >
                    {imageModelOptions.map((m) => (
                      <option key={m} value={m}>
                        {imageModelLabel(m)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {mediaType === 'video' && (
                <div className="flex items-center gap-2 pt-1">
                  <label className="text-xs text-[var(--sd-muted)]">Model:</label>
                  <select
                    value={videoModel}
                    onChange={(e) => setVideoModel(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-[var(--sd-line-soft)] bg-white text-xs"
                  >
                    {videoModelOptions.map((m) => (
                      <option key={m} value={m}>
                        {videoModelLabel(m)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {mediaType === 'video' && (
                <div className="flex items-center gap-2 pt-1">
                  <label className="text-xs text-[var(--sd-muted)]">Duration:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {videoDurationOptions.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDurationSeconds(d)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          durationSeconds === d
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white border-[var(--sd-line-soft)] text-[var(--sd-muted)] hover:border-purple-300'
                        }`}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[11px] text-[var(--sd-muted)]">
                Image works with either OpenAI or Gemini (Nano Banana) — whichever provider is
                connected. Video always uses Gemini (Veo) and publishes to Instagram Reels or
                Facebook Page video. A single Veo call only produces 8s — longer durations chain
                "extend" calls in ~7s steps (15s = 2 Veo requests, 22s = 3, 29s = 4).
              </p>
              {mediaType === 'video' && (
                <p className="text-[11px] text-amber-600">
                  Veo needs a paid Gemini plan with billing enabled — free-tier keys usually have
                  0 Veo quota, so Auto Run would fail every scheduled cycle until billing is on.
                  Longer durations use proportionally more of your daily Veo quota per post. Check{' '}
                  <a href="https://ai.dev/rate-limit" target="_blank" rel="noreferrer" className="hover:underline">
                    ai.dev/rate-limit
                  </a>{' '}
                  before enabling.
                </p>
              )}
            </div>

            {mediaType !== 'none' && (
              <label className="block pl-6">
                <span className="text-xs font-medium text-[var(--sd-muted)]">Media style</span>
                <p className="text-[11px] text-[var(--sd-muted)] mt-0.5 mb-1">
                  Describe what the image or video should look like — AI considers this when
                  generating it.
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
                          : 'bg-white border-[var(--sd-line-soft)] text-[var(--sd-muted)] hover:border-violet-300'
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
                  className="w-full px-3 py-2 rounded-xl border border-[var(--sd-line-soft)] bg-white text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-colors"
                />
              </label>
            )}
          </div>

          <div className="space-y-2 pt-1 border-t border-[var(--sd-line-soft)]">
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
                      : 'bg-white border-[var(--sd-line-soft)] text-[var(--sd-muted)] hover:border-purple-300'
                  }`}
                >
                  {intervalLabel(h)}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={() => saveAll()} disabled={saving} className="sd-btn sd-btn-primary px-5 py-2.5 text-sm">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        {auto && (
          <div className="sd-card p-4 space-y-3 text-sm lg:sticky lg:top-6">
            <p className="font-semibold text-[var(--sd-ink)]">Status</p>
            <dl className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[var(--sd-subtle)]">Last run</dt>
                <dd>{formatWhen(auto.lastRunAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[var(--sd-subtle)]">Next run</dt>
                <dd>{formatWhen(auto.nextRunAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[var(--sd-subtle)]">Last status</dt>
                <dd className="capitalize">{auto.lastStatus || 'idle'}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[var(--sd-subtle)]">Runs completed</dt>
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
              className="sd-btn sd-btn-secondary w-full px-4 py-2.5 text-sm text-purple-700"
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
