import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'glintly-ui';
import { Sparkles, Loader2, X, Clapperboard, Send, TriangleAlert, CheckCircle2 } from 'lucide-react';
import {
  type Connection,
  useAiConfig,
  useAiContexts,
  useCreatePost,
  useGenerateWithAi,
  useVideoGenerations,
  usePublishVideoGeneration,
} from '@/api/services/socialDeck';

const CATEGORIES = [
  'Technology',
  'Science',
  'Business',
  'Health',
  'Education',
  'Entertainment',
  'Lifestyle',
  'News',
  'Other',
];

const DURATION_OPTIONS = [5, 6, 7, 8];

type MediaType = 'none' | 'image' | 'video';

export default function ComposeSection({ connection }: { connection: Connection }) {
  const { data: aiData } = useAiConfig();
  const { data: contextsData } = useAiContexts();
  const createPost = useCreatePost();
  const generateWithAi = useGenerateWithAi();
  const { data: videoJobsData } = useVideoGenerations(connection.id);
  const publishVideo = usePublishVideoGeneration(connection.id);
  const hasAi = !!aiData?.data?.ai?.connected;
  const isGeminiAi = aiData?.data?.ai?.provider === 'gemini';
  const canGenerateVideo = connection.type === 'instagram';
  const resolvedContext = connection.contextId
    ? contextsData?.data?.contexts.find((c) => c.id === connection.contextId)
    : undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tags, setTags] = useState('');
  const [prompt, setPrompt] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('none');
  const [durationSeconds, setDurationSeconds] = useState(8);
  const [videoJobId, setVideoJobId] = useState<string | null>(null);

  const videoJob = videoJobId
    ? videoJobsData?.data?.jobs.find((j) => j.id === videoJobId) ?? null
    : null;

  const MAX_MANUAL_IMAGES = 8;

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (images.length >= MAX_MANUAL_IMAGES) {
      toast.error(`Up to ${MAX_MANUAL_IMAGES} images per post`);
      return;
    }
    setImages((prev) => [...prev, url]);
    setImageUrlInput('');
  };

  const removeImageAt = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const generate = () => {
    if (!prompt.trim()) {
      toast.error('Enter a prompt for AI');
      return;
    }
    generateWithAi.mutate(
      {
        prompt: prompt.trim(),
        connectionIds: [connection.id],
        mediaType,
        ...(mediaType === 'video' ? { durationSeconds } : {}),
      },
      {
        onSuccess: (res) => {
          const post = res.data.post;
          setTitle(post.title);
          setContent(post.content);
          setCategory(post.category);
          setTags(post.tags.join(', '));
          setImages(post.images || []);
          setVideoJobId(post.videoJob?.id ?? null);
          if (post.videoJob) {
            toast.success('Draft ready — video generating in the background (usually 1–3 min)');
          } else {
            toast.success(
              post.images?.length
                ? `Draft + ${post.images.length} image${post.images.length === 1 ? '' : 's'} generated — review and publish`
                : 'Draft generated — review and publish',
            );
          }
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const submit = (publish: boolean) => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    createPost.mutate(
      {
        title: title.trim(),
        content,
        images,
        category,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        connectionIds: [connection.id],
        publish,
      },
      {
        onSuccess: () => {
          toast.success(publish ? 'Published!' : 'Saved as draft');
          if (publish) {
            setTitle('');
            setContent('');
            setImages([]);
            setTags('');
            setPrompt('');
          }
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  const publishVideoNow = () => {
    if (!videoJob) return;
    publishVideo.mutate(videoJob.id, {
      onSuccess: (res) => {
        if (res.data.job.status === 'published') {
          toast.success('Posted to Instagram');
          setTitle('');
          setContent('');
          setTags('');
          setPrompt('');
          setVideoJobId(null);
        } else {
          toast.error(res.data.job.error || 'Publish failed');
        }
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  const generateLabel =
    mediaType === 'video' ? 'Generating draft + video…' : mediaType === 'image' ? 'Generating draft + image…' : 'Generating…';

  return (
    <div className="space-y-4">
      <h2 className="sd-display text-lg font-bold">Photo &amp; Text Post</h2>

      {hasAi ? (
        <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <p className="text-sm font-semibold text-violet-900">Write with AI</p>
          </div>
          <textarea
            placeholder="Describe what you want to post, e.g. “Explain why TypeScript helps large teams, friendly tone for developers”"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full max-w-3xl px-3 py-2 rounded-xl border border-violet-200 bg-white text-sm resize-y"
          />

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-violet-900">Also generate media (picked at random, in your saved style):</p>
            <div className="flex flex-wrap gap-3 text-xs text-violet-900">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="media-type"
                  checked={mediaType === 'none'}
                  onChange={() => setMediaType('none')}
                  className="border-violet-300"
                />
                None
              </label>
              <label
                className={`flex items-center gap-1.5 ${isGeminiAi ? 'opacity-50' : 'cursor-pointer'}`}
                title={isGeminiAi ? 'Image generation needs an OpenAI connection — Gemini covers text drafts only.' : ''}
              >
                <input
                  type="radio"
                  name="media-type"
                  checked={mediaType === 'image'}
                  disabled={isGeminiAi}
                  onChange={() => setMediaType('image')}
                  className="border-violet-300"
                />
                Image (1–4)
              </label>
              <label
                className={`flex items-center gap-1.5 ${!canGenerateVideo || !isGeminiAi ? 'opacity-50' : 'cursor-pointer'}`}
                title={
                  !canGenerateVideo
                    ? 'Video currently publishes to Instagram Reels only'
                    : !isGeminiAi
                      ? 'Video generation needs a Gemini connection — it uses Veo.'
                      : ''
                }
              >
                <input
                  type="radio"
                  name="media-type"
                  checked={mediaType === 'video'}
                  disabled={!canGenerateVideo || !isGeminiAi}
                  onChange={() => setMediaType('video')}
                  className="border-violet-300"
                />
                Video (Reel)
              </label>
            </div>
            {mediaType === 'video' && (
              <div className="flex items-center gap-2 pt-1">
                <label className="text-xs text-violet-900">Duration:</label>
                <select
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg border border-violet-200 bg-white text-xs"
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}s
                    </option>
                  ))}
                </select>
              </div>
            )}
            {mediaType === 'video' && (
              <p className="text-[11px] text-amber-600">
                Veo needs a paid Gemini plan with billing enabled — free-tier keys usually have 0
                Veo quota, so this may fail with a quota error until billing is on. Check{' '}
                <a href="https://ai.dev/rate-limit" target="_blank" rel="noreferrer" className="hover:underline">
                  ai.dev/rate-limit
                </a>
                .
              </p>
            )}
            {resolvedContext?.imageStyle && mediaType !== 'none' && (
              <p className="text-xs text-violet-700/80">
                Style: “{resolvedContext.imageStyle.slice(0, 80)}
                {resolvedContext.imageStyle.length > 80 ? '…' : ''}” — set in the Briefing tab.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={generateWithAi.isPending || !prompt.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50"
          >
            {generateWithAi.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {generateLabel}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate draft
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-violet-200 p-4 text-sm text-[var(--sd-muted)]">
          Connect{' '}
          <Link to="/" className="text-purple-600 hover:underline">
            AI Assistant on the Dashboard
          </Link>{' '}
          to generate posts from a prompt, or write manually below.
        </div>
      )}

      {videoJob && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
              <Clapperboard className="w-4 h-4 text-violet-600" />
              AI video
            </p>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0 bg-blue-100 text-blue-800">
              {videoJob.status === 'generating' && 'Generating…'}
              {videoJob.status === 'ready' && 'Ready to publish'}
              {videoJob.status === 'publishing' && 'Publishing…'}
              {videoJob.status === 'published' && 'Published'}
              {videoJob.status === 'failed' && 'Failed'}
            </span>
          </div>

          {videoJob.status === 'generating' && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating — usually takes 1–3 minutes, checking every few seconds…
            </p>
          )}

          {videoJob.status === 'failed' && (
            <p className="text-xs text-red-600 mt-2 flex items-center gap-1.5">
              <TriangleAlert className="w-3.5 h-3.5" />
              {videoJob.error || 'Something went wrong'}
            </p>
          )}

          {(videoJob.status === 'ready' || videoJob.status === 'publishing') && videoJob.videoUrl && (
            <div className="mt-3 flex items-start gap-3">
              <video src={videoJob.videoUrl} controls className="w-32 rounded-lg bg-black shrink-0" />
              <div className="flex-1">
                {videoJob.error && (
                  <p className="text-xs text-red-600 mb-2 flex items-center gap-1.5">
                    <TriangleAlert className="w-3.5 h-3.5" />
                    {videoJob.error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={publishVideoNow}
                  disabled={publishVideo.isPending || videoJob.status === 'publishing'}
                  className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {videoJob.status === 'publishing' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Publish to Instagram
                </button>
              </div>
            </div>
          )}

          {videoJob.status === 'published' && (
            <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {videoJob.externalUrl ? (
                <a href={videoJob.externalUrl} target="_blank" rel="noreferrer" className="hover:underline">
                  View on Instagram
                </a>
              ) : (
                'Published'
              )}
            </p>
          )}
        </div>
      )}

      <input
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full max-w-3xl px-3 py-2 rounded-xl border border-gray-200 text-sm"
      />
      <textarea
        placeholder="Write your post…"
        rows={8}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full max-w-3xl px-3 py-2 rounded-xl border border-gray-200 text-sm resize-y"
      />

      {!videoJob && (
        <div className="space-y-2 max-w-3xl">
          <div className="flex gap-2">
            <input
              placeholder="Paste an image URL to add it manually"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addImageUrl();
                }
              }}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm"
            />
            <button
              type="button"
              onClick={addImageUrl}
              disabled={!imageUrlInput.trim()}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Add
            </button>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 aspect-square"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImageAt(i)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-gray-700 shadow hover:bg-white"
                    aria-label="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3 max-w-3xl">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm"
        />
      </div>

      {!videoJob && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={createPost.isPending}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={createPost.isPending}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-60"
          >
            {createPost.isPending ? 'Publishing…' : 'Publish now'}
          </button>
        </div>
      )}
    </div>
  );
}
