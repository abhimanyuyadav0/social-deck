import { useState, useEffect } from 'react';
import { toast } from 'glintly-ui';
import {
  X,
  Share2,
  Copy,
  Check,
  Loader2,
  Users,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Link2,
  AlertCircle,
  Plus,
  ExternalLink,
} from 'lucide-react';
import {
  type SocialPost,
  useConnections,
  usePublishPost,
  useUpdatePost,
  useCreatePost,
} from '@/api/services/socialDeck';

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  ttf_community: Users,
  community: Users,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
};

export interface CrossPostModalProps {
  post: SocialPost | null;
  onClose: () => void;
}

export default function CrossPostModal({ post, onClose }: CrossPostModalProps) {
  const { data: connectionsData } = useConnections();
  const publishPost = usePublishPost();
  const updatePost = useUpdatePost();
  const createPost = useCreatePost();

  const connections = (connectionsData?.data?.connections ?? []).filter(
    (c) => c.status === 'connected',
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [publishSuccessResults, setPublishSuccessResults] = useState<
    Array<{ name: string; url?: string; type?: string }>
  >([]);

  useEffect(() => {
    if (!post) {
      setSelectedIds([]);
      setPublishSuccessResults([]);
      return;
    }
    setTitle(post.title || '');
    setContent(post.content || '');
    setImages(post.images || []);
    setVideoUrl(post.videoUrl || '');
    setIsEditing(!post.id || !post.title);
    setPublishSuccessResults([]);

    const postHasMedia = (post.images?.length ?? 0) > 0 || !!post.videoUrl;
    const postHasVideo = !!post.videoUrl;

    // Auto-select text-capable platforms that haven't published yet
    const publishedIds = new Set(
      post.results?.filter((r) => r.status === 'published').map((r) => r.connectionId) ?? [],
    );
    const textCapable = connections
      .filter((c) => (c.type !== 'youtube' || postHasVideo) && (postHasMedia || c.type !== 'instagram'))
      .filter((c) => !publishedIds.has(c.id))
      .map((c) => c.id);

    setSelectedIds(textCapable);
  }, [post, connectionsData]);

  if (!post) return null;

  const hasImages = images.length > 0;
  const hasVideo = !!videoUrl.trim();
  const hasMedia = hasImages || hasVideo;

  const toggleConnection = (id: string, disabled: boolean) => {
    if (disabled) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleCopy = () => {
    const fullText = `${title}\n\n${content}`.trim();
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('Post text copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const addImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      toast.error('Image URL must start with http:// or https://');
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setNewImageUrl('');
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select at least one channel to publish to');
      return;
    }

    try {
      let res;
      if (!post.id) {
        // Create new post and publish to selected channels
        res = await createPost.mutateAsync({
          title: title.trim() || 'Social Update',
          content: content.trim(),
          images,
          videoUrl: hasVideo ? videoUrl.trim() : null,
          connectionIds: selectedIds,
          publish: true,
        });
      } else {
        // Save changes if modified
        if (
          title !== post.title ||
          content !== post.content ||
          images !== post.images ||
          videoUrl !== (post.videoUrl || '')
        ) {
          await updatePost.mutateAsync({
            id: post.id,
            title,
            content,
            images,
            videoUrl: hasVideo ? videoUrl.trim() : null,
          });
        }

        // Publish to selected connections
        res = await publishPost.mutateAsync({
          id: post.id,
          connectionIds: selectedIds,
        });
      }

      const results = res.data.post.results || [];
      const successes = results
        .filter((r) => r.connectionId && selectedIds.includes(r.connectionId) && r.status === 'published')
        .map((r) => ({
          name: r.connectionName || 'Platform',
          url: r.externalUrl,
          type: r.connectionType || 'platform',
        }));

      const failures = results
        .filter((r) => r.connectionId && selectedIds.includes(r.connectionId) && r.status === 'failed')
        .map((r) => r.error);

      if (successes.length > 0) {
        setPublishSuccessResults(successes);
        toast.success(`Published to ${successes.length} channel${successes.length > 1 ? 's' : ''}`);
      }
      if (failures.length > 0) {
        toast.error(`Some channels failed: ${failures[0]}`);
      }
    } catch (e: any) {
      toast.error(e.message || 'Publishing failed');
    }
  };

  const isPending = publishPost.isPending || updatePost.isPending || createPost.isPending;

  return (
    <div className="sd-modal-overlay">
      <div className="sd-modal-panel w-full max-w-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="sd-badge bg-indigo-50 text-indigo-700 border-indigo-200">
                <Share2 className="w-3 h-3 text-indigo-500" />
                Cross-Platform Publisher
              </span>
            </div>
            <h2 className="sd-display text-xl font-bold text-slate-900">
              {!post.id ? 'New Cross-Platform Post' : 'Reuse & Cross-Post to Channels'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {!post.id
                ? 'Compose once and broadcast to all your connected channels simultaneously.'
                : 'Publish this content to your other connected platforms in one click.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sd-btn sd-btn-ghost p-1.5 shrink-0 text-slate-400 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Preview Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Post Content
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy text</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                {isEditing ? 'Done Editing' : 'Edit Text'}
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-400"
              />
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Post body content"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-indigo-400 leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">{title}</p>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-4">
                {content}
              </p>
            </div>
          )}

          {/* Media preview */}
          {images.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {images.map((url, i) => (
                <div key={`${url}-${i}`} className="relative group">
                  <img
                    src={url}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200 shadow-xs"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/60 text-emerald-800 text-xs">
              <span className="font-semibold">💡 Text-only content:</span>
              <span>LinkedIn, Facebook Pages, and Community support this post as-is without images.</span>
            </div>
          )}

          {/* Add image option */}
          {isEditing && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste an image URL (https://…) to include on Instagram"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
              />
              <button
                type="button"
                onClick={addImage}
                className="sd-btn sd-btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
          )}
        </div>

        {/* Target Channels List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Target Channels
            </span>
            <span className="text-xs text-slate-400">
              {selectedIds.length} channel{selectedIds.length === 1 ? '' : 's'} selected
            </span>
          </div>

          {connections.length === 0 ? (
            <p className="text-xs text-slate-500 p-4 text-center rounded-xl border border-slate-200">
              No connected social channels found. Connect LinkedIn, Facebook, or Community first.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {connections.map((conn) => {
                const Icon = PLATFORM_ICONS[conn.type] || Link2;
                const isInstagram = conn.type === 'instagram';
                const isYouTube = conn.type === 'youtube';
                const needsMedia = isInstagram && !hasMedia;
                const needsVideo = isYouTube && !hasVideo;
                const disabled = needsMedia || needsVideo;
                const checked = selectedIds.includes(conn.id);

                return (
                  <div
                    key={conn.id}
                    onClick={() => toggleConnection(conn.id, disabled)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      disabled
                        ? 'opacity-50 bg-slate-50 border-slate-200 cursor-not-allowed'
                        : checked
                          ? 'border-indigo-400 bg-indigo-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleConnection(conn.id, disabled)}
                      className="mt-0.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                        <p className="text-xs font-bold text-slate-900 truncate">{conn.name}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 capitalize">
                        {conn.type.replace('_', ' ')}
                      </p>
                      {needsMedia ? (
                        <p className="text-[10px] text-amber-700 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Instagram requires media
                        </p>
                      ) : needsVideo ? (
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          YouTube requires video
                        </p>
                      ) : (
                        <p className="text-[10px] text-emerald-700 mt-1">
                          ✓ Ready to publish
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Success Results Links */}
        {publishSuccessResults.length > 0 && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
            <p className="text-xs font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Published Live! View your post:
            </p>
            <div className="flex flex-wrap gap-2">
              {publishSuccessResults.map((item, i) => (
                item.url ? (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100/60"
                  >
                    <span>View on {item.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold"
                  >
                    ✓ Published on {item.name}
                  </span>
                )
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="sd-btn sd-btn-secondary px-4 py-2 text-xs"
          >
            {publishSuccessResults.length > 0 ? 'Done' : 'Cancel'}
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0 || isPending}
            onClick={handlePublish}
            className="sd-btn sd-btn-primary px-5 py-2 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Publishing to {selectedIds.length} channel{selectedIds.length === 1 ? '' : 's'}…
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                Publish to {selectedIds.length} Channel{selectedIds.length === 1 ? '' : 's'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
