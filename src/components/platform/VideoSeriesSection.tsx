import { useState } from 'react';
import { toast } from 'glintly-ui';
import { Film, Loader2, Play, Pause, Trash2, X, Upload } from 'lucide-react';
import {
  type Connection,
  type VideoSeries,
  useVideoSeriesList,
  useCreateVideoSeries,
  usePauseVideoSeries,
  useResumeVideoSeries,
  useDeletePostedContent,
  useDeleteVideoSeriesRecord,
} from '@/api/services/socialDeck';
import AutoResizeTextarea from '@/components/AutoResizeTextarea';

const INTERVAL_OPTIONS_MINUTES = [5, 10, 15, 30, 60, 120];
const SEGMENT_OPTIONS_SECONDS = [15, 30, 60];

const STATUS_STYLE: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  running: 'bg-blue-100 text-blue-800',
  paused: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cleaning_up: 'bg-gray-100 text-gray-600',
  cleaned_up: 'bg-gray-100 text-gray-600',
  failed: 'bg-red-100 text-red-800',
};

const PART_STATUS_STYLE: Record<string, string> = {
  pending: 'bg-gray-200',
  posted: 'bg-emerald-500',
  failed: 'bg-red-500',
};

function formatWhen(iso?: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function ConfirmDeletePostsModal({
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
        <h2 className="font-semibold text-gray-900">Delete posted Reels?</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          This permanently removes every part of this series that's currently live on Instagram.
          This can&apos;t be undone.
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
            {pending ? 'Deleting…' : 'Delete from Instagram'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SeriesCard({ series }: { series: VideoSeries }) {
  const pause = usePauseVideoSeries();
  const resume = useResumeVideoSeries();
  const deletePosted = useDeletePostedContent();
  const deleteRecord = useDeleteVideoSeriesRecord();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const postedCount = series.parts.filter((p) => p.status === 'posted').length;
  const hasLiveContent = postedCount > 0;

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <ConfirmDeletePostsModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        pending={deletePosted.isPending}
        onConfirm={() =>
          deletePosted.mutate(series.id, {
            onSuccess: () => {
              toast.success('Posted content deleted');
              setConfirmDelete(false);
            },
            onError: (e: Error) => toast.error(e.message),
          })
        }
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {series.caption || 'Untitled series'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {series.parts.length} part{series.parts.length === 1 ? '' : 's'} · {series.segmentSeconds}s
            clips · every {series.intervalMinutes} min · created {formatWhen(series.createdAt)}
          </p>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${
            STATUS_STYLE[series.status] ?? STATUS_STYLE.scheduled
          }`}
        >
          {series.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {series.parts.map((p) => (
          <span
            key={p.order}
            title={`Part ${p.order}: ${p.status}${p.error ? ` — ${p.error}` : ''}`}
            className={`w-3 h-3 rounded-full ${PART_STATUS_STYLE[p.status]}`}
          />
        ))}
      </div>

      {series.status === 'scheduled' && (
        <p className="text-xs text-gray-500">Next part posts around {formatWhen(series.nextPostAt)}</p>
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            Resume
          </button>
        )}
        {hasLiveContent && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete posted content ({postedCount})
          </button>
        )}
        {!hasLiveContent && (
          <button
            type="button"
            onClick={() =>
              deleteRecord.mutate(series.id, { onError: (e: Error) => toast.error(e.message) })
            }
            disabled={deleteRecord.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-red-600 disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            Remove
          </button>
        )}
      </div>
    </li>
  );
}

/** Instagram-only: upload one video, get it auto-cut into ~30s Reels, posted one by one. */
export default function VideoSeriesSection({ connection }: { connection: Connection }) {
  const { data: seriesData, isLoading } = useVideoSeriesList();
  const createSeries = useCreateVideoSeries();

  const seriesList = (seriesData?.data?.series ?? []).filter(
    (s) => s.connectionId === connection.id,
  );

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [intervalMinutes, setIntervalMinutes] = useState(15);
  const [segmentSeconds, setSegmentSeconds] = useState(30);
  const [customSegment, setCustomSegment] = useState(false);

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
          setCaption('');
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="sd-display text-lg font-bold flex items-center gap-2">
        <Film className="w-5 h-5 text-purple-600" />
        Video Reel Series
      </h2>
      <p className="text-sm text-[var(--sd-muted)] -mt-2">
        A different flow from the Photo &amp; Text Post above — upload one video of any length,
        size, or shape, we cut it into equal clips at whatever length you choose, and post them
        one by one as separate Reels on a schedule.
      </p>

      <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-5 space-y-4 max-w-3xl">
        <label className="block">
          <span className="text-xs font-medium text-gray-600">Video</span>
          <p className="text-[11px] text-[var(--sd-muted)] mt-0.5 mb-1">
            Any aspect ratio works — vertical (9:16) posts as-is; horizontal or square video is
            automatically scaled to fit and letterboxed into the Reels frame.
          </p>
          <label className="mt-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 bg-white text-sm cursor-pointer hover:border-purple-300">
            <Upload className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate text-gray-600">
              {videoFile ? videoFile.name : 'Choose a video file (MP4, MOV, WebM)'}
            </span>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              className="hidden"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
          </label>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-600">Clip length</span>
          <p className="text-[11px] text-[var(--sd-muted)] mt-0.5 mb-1">
            How long each cut piece is. The last clip may be shorter if the video doesn&apos;t
            divide evenly.
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
                    : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
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
                  : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
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
                  className="w-20 px-2 py-1.5 rounded-lg border border-gray-200 text-xs"
                />
                <span className="text-xs text-gray-500">seconds (5–90)</span>
              </div>
            )}
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-600">Caption</span>
          <AutoResizeTextarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Base caption — each part gets “· Part N/M” appended automatically"
            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-gray-600">Post gap</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {INTERVAL_OPTIONS_MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setIntervalMinutes(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  intervalMinutes === m
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
                }`}
              >
                Every {m < 60 ? `${m} min` : `${m / 60} hr`}
              </button>
            ))}
          </div>
        </label>

        <button
          type="button"
          onClick={submit}
          disabled={createSeries.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold disabled:opacity-50"
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
        <p className="text-sm text-gray-400">Loading…</p>
      ) : seriesList.length === 0 ? (
        <p className="text-sm text-gray-400">No video series yet.</p>
      ) : (
        <ul className="space-y-3">
          {seriesList.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </ul>
      )}
    </div>
  );
}
