import { useMemo, useState } from 'react';
import { toast } from 'glintly-ui';
import { RotateCcw, Loader2, Film, Share2, Copy, Check, AlertCircle, Edit3 } from 'lucide-react';
import CrossPostModal from './CrossPostModal';
import { EditPostModal } from './EditPostModal';
import {
  type Connection,
  type SocialPost,
  type VideoSeries,
  type VideoSeriesPart,
  usePosts,
  usePublishPost,
  useVideoSeriesList,
} from '@/api/services/socialDeck';

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-emerald-100 text-emerald-800',
  partial: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
  publishing: 'bg-blue-100 text-blue-800',
};

const cardCx = 'sd-card sd-card-hover p-4';

function formatPostTime(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

type HistoryItem =
  | { kind: 'post'; sortAt: number; post: SocialPost }
  | { kind: 'video-part'; sortAt: number; series: VideoSeries; part: VideoSeriesPart };

function VideoPartRow({ series, part }: { series: VideoSeries; part: VideoSeriesPart }) {
  const label = series.caption
    ? `${series.caption} · Part ${part.order}/${series.parts.length}`
    : `Video Reel · Part ${part.order}/${series.parts.length}`;

  return (
    <li className={cardCx}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-[var(--sd-ink)] flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-violet-500 shrink-0" />
            {label}
          </p>
          {part.postedAt && (
            <p className="text-[11px] text-[var(--sd-subtle)] mt-1.5">Posted {formatPostTime(part.postedAt)}</p>
          )}
        </div>
        <span
          className={`sd-badge shrink-0 ${
            part.status === 'posted' ? STATUS_STYLE.published : STATUS_STYLE.failed
          }`}
        >
          {part.status === 'posted' ? 'published' : part.status}
        </span>
      </div>
      {(part.externalUrl || part.error) && (
        <div className="mt-2 text-xs text-[var(--sd-muted)] flex flex-wrap items-center gap-x-2 gap-y-1">
          {part.externalUrl && (
            <a
              href={part.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-purple-600 hover:underline"
            >
              View
            </a>
          )}
          {part.error && <span className="text-red-500">{part.error}</span>}
        </div>
      )}
    </li>
  );
}

export default function PostHistorySection({ connection }: { connection: Connection }) {
  const { data, isLoading } = usePosts();
  const { data: seriesData, isLoading: isLoadingSeries } = useVideoSeriesList();
  const publishPost = usePublishPost();
  const [retryingKey, setRetryingKey] = useState<string | null>(null);
  const [crossPostTarget, setCrossPostTarget] = useState<SocialPost | null>(null);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const posts = (data?.data?.posts ?? []).filter(
    (p) =>
      p.targetConnectionIds?.includes(connection.id) ||
      p.results?.some((r) => r.connectionId === connection.id),
  );

  const seriesForConnection = (seriesData?.data?.series ?? []).filter(
    (s) => s.connectionId === connection.id,
  );

  const items = useMemo<HistoryItem[]>(() => {
    const postItems: HistoryItem[] = posts.map((post) => ({
      kind: 'post',
      sortAt: new Date(post.publishedAt || post.createdAt).getTime() || 0,
      post,
    }));

    const videoItems: HistoryItem[] = seriesForConnection.flatMap((series) =>
      series.parts
        .filter((part) => part.status === 'posted' || part.status === 'failed')
        .map((part) => ({
          kind: 'video-part' as const,
          sortAt: new Date(part.postedAt || series.createdAt).getTime() || 0,
          series,
          part,
        })),
    );

    return [...postItems, ...videoItems].sort((a, b) => b.sortAt - a.sortAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, seriesForConnection]);

  const retryFailed = (postId: string) => {
    const key = `${postId}:${connection.id}`;
    setRetryingKey(key);
    publishPost.mutate(
      { id: postId, connectionIds: [connection.id] },
      {
        onSuccess: () => toast.success('Retry complete'),
        onError: (e: Error) => toast.error(e.message),
        onSettled: () => setRetryingKey(null),
      },
    );
  };

  const loading = isLoading || isLoadingSeries;

  return (
    <div className="space-y-4">
      <CrossPostModal
        post={crossPostTarget}
        onClose={() => setCrossPostTarget(null)}
      />
      <EditPostModal
        open={!!editingPost}
        post={editingPost}
        onClose={() => setEditingPost(null)}
        targetConnectionId={connection.id}
      />
      <h2 className="sd-display text-lg font-bold text-[var(--sd-ink)]">Post history</h2>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="sd-skeleton h-20" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-[var(--sd-subtle)]">No posts yet for this connection.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) =>
            item.kind === 'video-part' ? (
              <VideoPartRow key={`video-${item.series.id}-${item.part.order}`} series={item.series} part={item.part} />
            ) : (
              <li key={item.post.id} className={cardCx}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-[var(--sd-ink)]">{item.post.title}</p>
                    <p className="text-xs text-[var(--sd-muted)] mt-1 line-clamp-2">{item.post.content}</p>
                    {formatPostTime(item.post.publishedAt || item.post.createdAt) && (
                      <p className="text-[11px] text-[var(--sd-subtle)] mt-1.5">
                        {item.post.publishedAt ? 'Posted' : 'Created'}{' '}
                        {formatPostTime(item.post.publishedAt || item.post.createdAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-start gap-2 sm:shrink-0">
                    {item.post.images?.length > 0 && (
                      <div className="flex -space-x-2">
                        {item.post.images.slice(0, 3).map((url, i) => (
                          <img
                            key={`${url}-${i}`}
                            src={url}
                            alt=""
                            className="w-14 h-14 rounded-lg object-cover border-2 border-white shadow-sm"
                            style={{ zIndex: 3 - i }}
                          />
                        ))}
                        {item.post.images.length > 3 && (
                          <span className="w-14 h-14 rounded-lg bg-gray-800/80 text-white text-xs font-semibold flex items-center justify-center border-2 border-white">
                            +{item.post.images.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    {item.post.videoUrl && (
                      <div className="w-14 h-14 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center border-2 border-white shadow-sm shrink-0">
                        <Film className="w-5 h-5 text-indigo-400" />
                        <span className="text-[9px] font-bold text-slate-300 uppercase mt-0.5">Video</span>
                      </div>
                    )}
                    <span className={`sd-badge ${STATUS_STYLE[item.post.status] ?? STATUS_STYLE.draft}`}>
                      {item.post.status}
                    </span>
                  </div>
                </div>
                {item.post.results
                  ?.filter((r) => r.connectionId === connection.id)
                  .map((r, i) => {
                    const key = `${item.post.id}:${connection.id}:${i}`;
                    const isRetrying = retryingKey === `${item.post.id}:${connection.id}`;
                    return (
                      <div
                        key={key}
                        className="mt-2 text-xs text-[var(--sd-muted)] flex flex-wrap items-center gap-x-2 gap-y-1"
                      >
                        <span
                          className={`capitalize ${
                            r.status === 'failed'
                              ? 'text-red-600'
                              : r.status === 'published'
                                ? 'text-emerald-700'
                                : ''
                          }`}
                        >
                          {r.status}
                        </span>
                        {r.externalUrl && (
                          <a
                            href={r.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-600 hover:underline"
                          >
                            View
                          </a>
                        )}
                        {r.error && <span className="text-red-500">{r.error}</span>}
                        {r.status === 'failed' && (
                          <button
                            type="button"
                            disabled={isRetrying || publishPost.isPending}
                            onClick={() => retryFailed(item.post.id)}
                            className="inline-flex items-center gap-1 text-purple-700 font-semibold hover:underline disabled:opacity-50"
                          >
                            {isRetrying ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Retrying…
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-3 h-3" />
                                Retry
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                {/* Special guidance banner if Instagram failed due to missing image */}
                {connection.type === 'instagram' &&
                  item.post.results?.some(
                    (r) =>
                      r.connectionId === connection.id &&
                      r.status === 'failed' &&
                      (r.error?.toLowerCase().includes('image') ||
                        r.error?.toLowerCase().includes('media')),
                  ) && (
                    <div className="mt-2.5 p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
                      <div className="flex items-start sm:items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                        <span>
                          Instagram requires an image or video! Add media to post to Instagram, or cross-post this text to other platforms.
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingPost(item.post)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 text-xs shadow-xs transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Add Image / Video
                        </button>
                        <button
                          type="button"
                          onClick={() => setCrossPostTarget(item.post)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 text-xs shadow-xs transition-colors"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          Cross-post now
                        </button>
                      </div>
                    </div>
                  )}

                {/* Reuse & Cross-Post Action Bar */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setEditingPost(item.post)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                      Edit Post / Media
                    </button>
                    <button
                      type="button"
                      onClick={() => setCrossPostTarget(item.post)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 transition-colors shadow-2xs"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Cross-post / Reuse
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${item.post.title}\n\n${item.post.content}`.trim(),
                        );
                        setCopiedPostId(item.post.id);
                        toast.success('Post text copied');
                        setTimeout(() => setCopiedPostId(null), 2000);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      {copiedPostId === item.post.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy text</span>
                        </>
                      )}
                    </button>
                  </div>

                  {item.post.status === 'draft' &&
                    (item.post.targetConnectionIds?.length ?? 0) > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          publishPost.mutate(
                            { id: item.post.id },
                            {
                              onSuccess: () => toast.success('Published'),
                              onError: (e: Error) => toast.error(e.message),
                            },
                          )
                        }
                        className="text-xs font-semibold text-purple-600 hover:underline"
                      >
                        Publish now
                      </button>
                    )}
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
