import { useState } from 'react';
import { toast } from 'glintly-ui';
import { RotateCcw, Loader2 } from 'lucide-react';
import { type Connection, usePosts, usePublishPost } from '@/api/services/socialDeck';

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-emerald-100 text-emerald-800',
  partial: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
  publishing: 'bg-blue-100 text-blue-800',
};

function formatPostTime(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function PostHistorySection({ connection }: { connection: Connection }) {
  const { data, isLoading } = usePosts();
  const publishPost = usePublishPost();
  const [retryingKey, setRetryingKey] = useState<string | null>(null);

  const posts = (data?.data?.posts ?? []).filter(
    (p) =>
      p.targetConnectionIds?.includes(connection.id) ||
      p.results?.some((r) => r.connectionId === connection.id),
  );

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

  return (
    <div className="space-y-4">
      <h2 className="sd-display text-lg font-bold">Post history</h2>
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-gray-400">No posts yet for this connection.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm">{post.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.content}</p>
                  {formatPostTime(post.publishedAt || post.createdAt) && (
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      {post.publishedAt ? 'Posted' : 'Created'}{' '}
                      {formatPostTime(post.publishedAt || post.createdAt)}
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-2 sm:shrink-0">
                  {post.images?.length > 0 && (
                    <div className="flex -space-x-2">
                      {post.images.slice(0, 3).map((url, i) => (
                        <img
                          key={`${url}-${i}`}
                          src={url}
                          alt=""
                          className="w-14 h-14 rounded-lg object-cover border-2 border-white shadow-sm"
                          style={{ zIndex: 3 - i }}
                        />
                      ))}
                      {post.images.length > 3 && (
                        <span className="w-14 h-14 rounded-lg bg-gray-800/80 text-white text-xs font-semibold flex items-center justify-center border-2 border-white">
                          +{post.images.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                      STATUS_STYLE[post.status] ?? STATUS_STYLE.draft
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
              </div>
              {post.results
                ?.filter((r) => r.connectionId === connection.id)
                .map((r, i) => {
                  const key = `${post.id}:${connection.id}:${i}`;
                  const isRetrying = retryingKey === `${post.id}:${connection.id}`;
                  return (
                    <div
                      key={key}
                      className="mt-2 text-xs text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1"
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
                          onClick={() => retryFailed(post.id)}
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
              {post.status === 'draft' && (post.targetConnectionIds?.length ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    publishPost.mutate(
                      { id: post.id },
                      {
                        onSuccess: () => toast.success('Published'),
                        onError: (e: Error) => toast.error(e.message),
                      },
                    )
                  }
                  className="mt-3 text-xs font-semibold text-purple-600 hover:underline"
                >
                  Publish now
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
