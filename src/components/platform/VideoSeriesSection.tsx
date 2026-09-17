import { useState } from 'react';
import { toast } from 'glintly-ui';
import { Film, Loader2, Play, Pause, Trash2, Upload, X, TriangleAlert, Send, RotateCcw } from 'lucide-react';
import {
  type Connection,
  type VideoSeries,
  useVideoSeriesList,
  useCreateVideoSeries,
  usePauseVideoSeries,
  useResumeVideoSeries,
  useRemoveVideoSeries,
  useSkipVideoSeriesPart,
  useRetryVideoSeriesPart,
  usePublishVideoSeriesPartNow,
  useUpdateVideoSeriesInterval,
} from '@/api/services/socialDeck';
import AutoResizeTextarea from '@/components/AutoResizeTextarea';
import PostGapSelector, { formatPostGap } from './PostGapSelector';

const SEGMENT_OPTIONS_SECONDS = [15, 30, 60];
/** A cut clip shorter than this is flagged as possibly not worth posting. */
const SHORT_CLIP_THRESHOLD_SECONDS = 5;

const STATUS_STYLE: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  running: 'bg-blue-100 text-blue-800',
  paused: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cleaning_up: 'bg-gray-100 text-[var(--sd-muted)]',
  cleaned_up: 'bg-gray-100 text-[var(--sd-muted)]',
  failed: 'bg-red-100 text-red-800',
};

const PART_STATUS_STYLE: Record<string, string> = {
  pending: 'bg-gray-100 text-[var(--sd-muted)]',
  posted: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  skipped: 'bg-gray-100 text-[var(--sd-subtle)] line-through',
};

function formatWhen(iso?: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatDuration(totalSeconds: number) {
  const s = Math.round(totalSeconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m > 0 ? `${m}m ${rem}s` : `${rem}s`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


function ConfirmRemoveModal({
  open,
  hasLiveContent,
  onClose,
  onConfirm,
  pending,
  isYouTube,
}: {
  open: boolean;
  hasLiveContent: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
  isYouTube?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="sd-modal-overlay">
      <div className="sd-modal-panel w-full max-w-sm p-6 space-y-4">
        <h2 className="font-bold text-[var(--sd-ink)]">Remove this series?</h2>
        <p className="text-sm text-[var(--sd-muted)] leading-relaxed">
          This takes it off this list and deletes its video files from Social Deck.
          {hasLiveContent
            ? " Posted parts stay visible in Post History as a record of what went out — this just stops managing/scheduling this series."
            : ''}
          {hasLiveContent && (
            <>
              {' '}
              <strong>It does not delete anything from {isYouTube ? 'YouTube' : 'Instagram'}</strong> — any parts already
              posted stay live there. Delete them in {isYouTube ? 'YouTube Studio' : 'the Instagram app'} if you want them gone too.
            </>
          )}
        </p>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="sd-btn sd-btn-secondary px-4 py-2 text-sm">
            Cancel
          </button>
          <button type="button" disabled={pending} onClick={onConfirm} className="sd-btn sd-btn-danger px-4 py-2 text-sm">
            {pending ? 'Removing…' : 'Remove from Social Deck'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SeriesCard({ series, isYouTube }: { series: VideoSeries; isYouTube?: boolean }) {
  const pause = usePauseVideoSeries();
  const resume = useResumeVideoSeries();
  const removeSeries = useRemoveVideoSeries();
  const skipPart = useSkipVideoSeriesPart();
  const retryPart = useRetryVideoSeriesPart();
  const publishNow = usePublishVideoSeriesPartNow();
  const updateInterval = useUpdateVideoSeriesInterval();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [editingInterval, setEditingInterval] = useState(false);

  const postedCount = series.parts.filter((p) => p.status === 'posted').length;
  const hasLiveContent = postedCount > 0;
  // The one part that would post next — only this one gets a "Publish now" button. Once it
  // posts, whichever part is pending after it becomes "next" and gets the button instead.
  const nextPendingOrder = series.parts.find((p) => p.status === 'pending')?.order;
  // A failed part blocks anything later from publishing until it's retried or skipped — the
  // backend enforces this too; disabling here just avoids a wasted click + error toast.
  const blockingFailedOrder = series.parts.find((p) => p.status === 'failed')?.order;

  return (
    <li className="sd-card sd-card-hover p-4 space-y-3">
      <ConfirmRemoveModal
        open={confirmRemove}
        hasLiveContent={hasLiveContent}
        onClose={() => setConfirmRemove(false)}
        pending={removeSeries.isPending}
        isYouTube={isYouTube}
        onConfirm={() =>
          removeSeries.mutate(series.id, {
            onSuccess: () => {
              toast.success('Series removed from Social Deck');
              setConfirmRemove(false);
            },
            onError: (e: Error) => toast.error(e.message),
          })
        }
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--sd-ink)] line-clamp-2">
            {series.caption || 'Untitled series'}
          </p>
          <p className="text-xs text-[var(--sd-subtle)] mt-1">
            {series.parts.length} part{series.parts.length === 1 ? '' : 's'} · {series.segmentSeconds}s
            target · created {formatWhen(series.createdAt)}
          </p>
          <p className="text-xs text-[var(--sd-subtle)] mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>Post gap: {formatPostGap(series.intervalMinutes)}</span>
            <button
              type="button"
              onClick={() => setEditingInterval((v) => !v)}
              className="text-purple-600 hover:underline"
            >
              {editingInterval ? 'Cancel' : 'Change'}
            </button>
          </p>
          {editingInterval && (
            <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-[11px] font-semibold text-slate-700 mb-2">Change post gap:</p>
              <PostGapSelector
                value={series.intervalMinutes}
                unit="minutes"
                compact
                disabled={updateInterval.isPending}
                onChange={(m) =>
                  updateInterval.mutate(
                    { id: series.id, intervalMinutes: m },
                    {
                      onSuccess: () => {
                        toast.success(`Post gap set to ${formatPostGap(m)}`);
                        setEditingInterval(false);
                      },
                      onError: (e: Error) => toast.error(e.message),
                    },
                  )
                }
              />
            </div>
          )}
        </div>
        <span className={`sd-badge shrink-0 ${STATUS_STYLE[series.status] ?? STATUS_STYLE.scheduled}`}>
          {series.status.replace(/_/g, ' ')}
        </span>
      </div>

      <ul className="space-y-1">
        {series.parts.map((p) => {
          const isShort = p.status === 'pending' && p.durationSeconds > 0 && p.durationSeconds < SHORT_CLIP_THRESHOLD_SECONDS;
          return (
            <li
              key={p.order}
              className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs ${
                isShort ? 'bg-amber-50 border border-amber-200' : 'bg-[var(--sd-surface-alt)]'
              }`}
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="text-[var(--sd-subtle)] shrink-0">Part {p.order}</span>
                {p.durationSeconds > 0 && (
                  <span className="text-[var(--sd-subtle)] shrink-0">· {formatDuration(p.durationSeconds)}</span>
                )}
                {isShort && (
                  <span className="inline-flex items-center gap-0.5 text-amber-700 shrink-0">
                    <TriangleAlert className="w-3 h-3" />
                    short
                  </span>
                )}
                {p.error && <span className="text-red-500 truncate">{p.error}</span>}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <span className={`sd-badge ${PART_STATUS_STYLE[p.status]}`}>{p.status}</span>
                {p.externalUrl && (
                  <a
                    href={p.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    View
                  </a>
                )}
                {p.status === 'pending' && p.order === nextPendingOrder && (
                  <button
                    type="button"
                    title={
                      blockingFailedOrder
                        ? `Part ${blockingFailedOrder} failed — retry or skip it first`
                        : 'Publish this part now instead of waiting for the schedule'
                    }
                    disabled={publishNow.isPending || !!blockingFailedOrder}
                    onClick={() =>
                      publishNow.mutate(series.id, {
                        onSuccess: (res) => {
                          const updated = res.data.series.parts.find((up) => up.order === p.order);
                          if (updated?.status === 'posted') toast.success(`Part ${p.order} published`);
                          else if (updated?.error) toast.error(updated.error);
                        },
                        onError: (e: Error) => toast.error(e.message),
                      })
                    }
                    className="inline-flex items-center gap-1 text-purple-700 font-semibold hover:underline disabled:opacity-50"
                  >
                    {publishNow.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Publish now
                  </button>
                )}
                {(p.status === 'pending' || p.status === 'failed') && (
                  <button
                    type="button"
                    title={p.status === 'failed' ? "Give up on this part — it won't be posted" : "Cancel this part — it won't be posted"}
                    disabled={skipPart.isPending}
                    onClick={() =>
                      skipPart.mutate(
                        { id: series.id, order: p.order },
                        { onError: (e: Error) => toast.error(e.message) },
                      )
                    }
                    className="text-[var(--sd-subtle)] hover:text-red-600 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {(p.status === 'failed' || p.status === 'skipped') && (
                  <button
                    type="button"
                    title={p.status === 'failed' ? 'Retry publishing this part now' : 'Publish this skipped part now'}
                    disabled={retryPart.isPending}
                    onClick={() =>
                      retryPart.mutate(
                        { id: series.id, order: p.order },
                        {
                          onSuccess: (res) => {
                            const updated = res.data.series.parts.find((up) => up.order === p.order);
                            if (updated?.status === 'posted') toast.success(`Part ${p.order} published`);
                            else if (updated?.error) toast.error(updated.error);
                          },
                          onError: (e: Error) => toast.error(e.message),
                        },
                      )
                    }
                    className="inline-flex items-center gap-1 text-purple-700 font-semibold hover:underline disabled:opacity-50"
                  >
                    {retryPart.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    {p.status === 'failed' ? 'Retry' : 'Send'}
                  </button>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      {series.status === 'scheduled' && (
        <p className="text-xs text-[var(--sd-subtle)]">Next part posts around {formatWhen(series.nextPostAt)}</p>
      )}
      {series.lastError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {series.lastError}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {(series.status === 'scheduled' || series.status === 'running') && (
          <button
            type="button"
            onClick={() =>
              pause.mutate(series.id, { onError: (e: Error) => toast.error(e.message) })
            }
            disabled={pause.isPending}
            className="sd-btn sd-btn-secondary px-3 py-1.5 text-xs"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause
          </button>
        )}
        {series.status === 'paused' && (
          <button
            type="button"
            onClick={() =>
              resume.mutate(series.id, { onError: (e: Error) => toast.error(e.message) })
            }
            disabled={resume.isPending}
            className="sd-btn sd-btn-primary px-3 py-1.5 text-xs"
          >
            <Play className="w-3.5 h-3.5" />
            Resume
          </button>
        )}
        <button
          type="button"
          onClick={() => setConfirmRemove(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove from Social Deck{hasLiveContent ? ` (${postedCount} live on ${isYouTube ? 'YouTube' : 'Instagram'})` : ''}
        </button>
      </div>
    </li>
  );
}

type VideoMeta = { duration: number; width: number; height: number };

/** Instagram-only: upload one video, get it auto-cut into Reels, posted one by one. */
export default function VideoSeriesSection({ connection }: { connection: Connection }) {
  const isYouTube = connection.type === 'youtube';
  const { data: seriesData, isLoading } = useVideoSeriesList();
  const createSeries = useCreateVideoSeries();

  const seriesList = (seriesData?.data?.series ?? []).filter(
    (s) => s.connectionId === connection.id && !s.removed,
  );

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);
  const [caption, setCaption] = useState('');
  const [intervalMinutes, setIntervalMinutes] = useState(15);
  const [segmentSeconds, setSegmentSeconds] = useState(30);
  const [customSegment, setCustomSegment] = useState(false);

  const onFileChange = (file: File | null) => {
    setVideoFile(file);
    setVideoMeta(null);
    if (!file) return;

    const url = URL.createObjectURL(file);
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.onloadedmetadata = () => {
      setVideoMeta({ duration: videoEl.duration, width: videoEl.videoWidth, height: videoEl.videoHeight });
      URL.revokeObjectURL(url);
    };
    videoEl.src = url;
  };

  const submit = () => {
    if (!videoFile) {
      toast.error('Choose a video to upload — any length or size, no need to pre-trim it');
      return;
    }
    createSeries.mutate(
      { video: videoFile, connectionId: connection.id, caption, intervalMinutes, segmentSeconds },
      {
        onSuccess: (res) => {
          toast.success(`Series created — ${res.data.series.parts.length} parts scheduled`);
          setVideoFile(null);
          setVideoMeta(null);
          setCaption('');
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const estimatedParts = videoMeta ? Math.max(1, Math.ceil(videoMeta.duration / segmentSeconds)) : null;
  const aspectHint = videoMeta
    ? videoMeta.width === videoMeta.height
      ? 'square'
      : videoMeta.width < videoMeta.height
        ? 'vertical'
        : 'horizontal (will be letterboxed)'
    : null;

  return (
    <div className="space-y-4">
      <h2 className="sd-display text-lg font-bold flex items-center gap-2">
        <Film className="w-5 h-5 text-purple-600" />
        {isYouTube ? 'YouTube Shorts Series' : 'Video Reel Series'}
      </h2>
      <p className="text-sm text-[var(--sd-muted)] -mt-2">
        {isYouTube
          ? 'Upload one video of any length, size, or shape. We cut it into equal clips at whatever length you choose, and post them one by one as YouTube Shorts on an automatic schedule.'
          : 'A different flow from the Photo & Text Post above — upload one video of any length, size, or shape, we cut it into equal clips at whatever length you choose, and post them one by one as separate Reels on a schedule.'}
      </p>

      <div className="sd-card p-5 sm:p-6 space-y-4 max-w-3xl" style={{ borderColor: '#e9d5ff', background: 'linear-gradient(180deg, #faf5ff 0%, #ffffff 40%)' }}>
        <label className="block">
          <span className="text-xs font-medium text-[var(--sd-muted)]">Video</span>
          <p className="text-[11px] text-[var(--sd-muted)] mt-0.5 mb-1">
            Any aspect ratio works — vertical (9:16) posts as-is; horizontal or square video is
            automatically scaled to fit and letterboxed into the {isYouTube ? 'Shorts' : 'Reels'} frame.
          </p>
          <label className="mt-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[var(--sd-line)] bg-white text-sm cursor-pointer hover:border-purple-300">
            <Upload className="w-4 h-4 text-[var(--sd-subtle)] shrink-0" />
            <span className="truncate text-[var(--sd-muted)]">
              {videoFile ? videoFile.name : 'Choose a video file (MP4, MOV, WebM)'}
            </span>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              className="hidden"
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            />
          </label>
          {videoFile && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--sd-subtle)] px-1">
              <span>{formatBytes(videoFile.size)}</span>
              {videoMeta ? (
                <>
                  <span>{formatDuration(videoMeta.duration)} long</span>
                  <span>
                    {videoMeta.width}×{videoMeta.height} ({aspectHint})
                  </span>
                  {estimatedParts && (
                    <span className="text-violet-700 font-medium">
                      ≈ {estimatedParts} clip{estimatedParts === 1 ? '' : 's'} at {segmentSeconds}s each
                    </span>
                  )}
                </>
              ) : (
                <span>Reading video details…</span>
              )}
            </div>
          )}
        </label>

        <label className="block">
          <span className="text-xs font-medium text-[var(--sd-muted)]">Clip length</span>
          <p className="text-[11px] text-[var(--sd-muted)] mt-0.5 mb-1">
            How long each cut piece is. Cuts land on the nearest keyframe, so actual clip lengths
            may vary a bit from this target — check each part&apos;s real length after creating
            the series.
          </p>
          <div className="flex flex-wrap gap-2">
            {SEGMENT_OPTIONS_SECONDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSegmentSeconds(s);
                  setCustomSegment(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  !customSegment && segmentSeconds === s
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white border-[var(--sd-line-soft)] text-[var(--sd-muted)] hover:border-purple-300'
                }`}
              >
                {s}s
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCustomSegment(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                customSegment
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white border-[var(--sd-line-soft)] text-[var(--sd-muted)] hover:border-purple-300'
              }`}
            >
              Custom
            </button>
            {customSegment && (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={5}
                  max={90}
                  value={segmentSeconds}
                  onChange={(e) => setSegmentSeconds(Number(e.target.value))}
                  className="w-20 px-2 py-1.5 rounded-lg border border-[var(--sd-line-soft)] text-xs"
                />
                <span className="text-xs text-[var(--sd-subtle)]">seconds (5–90)</span>
              </div>
            )}
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-[var(--sd-muted)]">Caption</span>
          <AutoResizeTextarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={
              isYouTube
                ? 'Base title/caption — each part gets “· Part N/M” appended automatically'
                : 'Base caption — each part gets “· Part N/M” appended automatically'
            }
            className="mt-1 w-full px-3 py-2 rounded-xl border border-[var(--sd-line-soft)] bg-white text-sm focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-colors"
          />
        </label>

        <div className="block space-y-1.5">
          <span className="text-xs font-medium text-[var(--sd-muted)]">Post gap</span>
          <p className="text-[11px] text-[var(--sd-muted)] -mt-1 mb-2">
            How long to wait between parts on the automatic schedule. You can also publish the
            next part manually at any time from its card below, ahead of schedule.
          </p>
          <PostGapSelector
            value={intervalMinutes}
            onChange={setIntervalMinutes}
            unit="minutes"
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={createSeries.isPending}
          className="sd-btn sd-btn-primary px-5 py-2.5 text-sm"
        >
          {createSeries.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Splitting & uploading — this can take a bit…
            </>
          ) : (
            'Create series'
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 max-w-3xl">
          <div className="sd-skeleton h-24" />
          <div className="sd-skeleton h-24" />
        </div>
      ) : seriesList.length === 0 ? (
        <p className="text-sm text-[var(--sd-subtle)]">No video series yet.</p>
      ) : (
        <ul className="space-y-3">
          {seriesList.map((s) => (
            <SeriesCard key={s.id} series={s} isYouTube={isYouTube} />
          ))}
        </ul>
      )}
    </div>
  );
}
