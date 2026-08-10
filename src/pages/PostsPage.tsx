import { usePosts, usePublishPost } from '@/api/services/socialDeck';
import { toast } from 'glintly-ui';

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-emerald-100 text-emerald-800',
  partial: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-800',
};

export default function PostsPage() {
  const { data, isLoading } = usePosts();
  const publishPost = usePublishPost();
  const posts = data?.data?.posts ?? [];

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
                <div>
                  <p className="font-semibold text-sm">{post.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.content}</p>
                </div>
                <span
                  className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                    STATUS_STYLE[post.status] ?? STATUS_STYLE.draft
                  }`}
                >
                  {post.status}
                </span>
              </div>
              {post.results?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {post.results.map((r, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                      <span>{r.connectionName}</span>
                      <span className="capitalize">{r.status}</span>
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
                    </li>
                  ))}
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
                      }
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
