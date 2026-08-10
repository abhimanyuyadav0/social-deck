import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePosts, usePublishPost, useConnections } from '@/api/services/socialDeck';
import { toast } from 'glintly-ui';
import { RotateCcw, Loader2 } from 'lucide-react';

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
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function PostsPage() {
  const { data, isLoading } = usePosts();
  const { data: connectionsData } = useConnections();
  const publishPost = usePublishPost();
  const posts = data?.data?.posts ?? [];
  const connections = connectionsData?.data?.connections ?? [];
  const [retryingKey, setRetryingKey] = useState<string | null>(null);

  const resolveConnectionId = (r: {
    connectionId?: string;
    connectionName: string;
    connectionType?: string;
  }) => {
    if (r.connectionId) return r.connectionId;
    const match = connections.find(
      (c) =>
        c.name === r.connectionName ||
        (r.connectionType && c.type === r.connectionType),
    );
    return match?.id;
  };

  const retryFailed = (postId: string, connectionId?: string) => {
    if (!connectionId) {
      toast.error('Missing connection — reconnect in Connections, then retry');
      return;
    }
    const key = `${postId}:${connectionId}`;
    setRetryingKey(key);
    publishPost.mutate(
      { id: postId, connectionIds: [connectionId] },
      {
        onSuccess: () => toast.success('Retry complete'),
        onError: (e: Error) => toast.error(e.message),
        onSettled: () => setRetryingKey(null),
      },
    );
  };

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="sd-display text-xl font-bold">Posts</h1>
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-gray-400">No posts yet. Compose your first post.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
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
                <div className="flex items-start gap-2 shrink-0">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover border border-gray-100"
                    />
                  ) : null}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                      STATUS_STYLE[post.status] ?? STATUS_STYLE.draft
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
              </div>
              {post.results?.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {post.results.map((r, i) => {
                    const connectionId = resolveConnectionId(r);
                    const key = `${post.id}:${connectionId || i}`;
                    const isRetrying = retryingKey === key;
                    return (
                      <li
                        key={key}
                        className="text-xs text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1"
                      >
                        <span className="font-medium text-gray-800">{r.connectionName}</span>
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
                          <>
                            <button
                              type="button"
                              disabled={isRetrying || publishPost.isPending}
                              onClick={() => retryFailed(post.id, connectionId)}
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
                            {/token|reconnect|authorized|oauth|missing/i.test(r.error || '') && (
                              <Link to="/connections" className="text-amber-700 hover:underline">
                                Reconnect
                              </Link>
                            )}
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
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
