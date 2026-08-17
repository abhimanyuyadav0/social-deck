import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'glintly-ui';
import { Sparkles, Loader2, X } from 'lucide-react';
import {
  useConnections,
  useCreatePost,
  useAiConfig,
  useAiContexts,
  useGenerateWithAi,
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

export default function ComposePage() {
  const { data } = useConnections();
  const { data: aiData } = useAiConfig();
  const { data: contextsData } = useAiContexts();
  const createPost = useCreatePost();
  const generateWithAi = useGenerateWithAi();
  const connections = (data?.data?.connections ?? []).filter((c) => c.status === 'connected');
  const contexts = contextsData?.data?.contexts ?? [];
  const hasAi = !!aiData?.data?.ai?.connected;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tags, setTags] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [generateImage, setGenerateImage] = useState(false);

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

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Mirrors the backend's resolveContextForConnections: a connection can belong to several
  // contexts, so the selected connections must share at least one context in common.
  const sharedContextIds = useMemo(() => {
    const withContexts = selected
      .map((id) => connections.find((c) => c.id === id)?.contextIds ?? [])
      .filter((ids) => ids.length > 0);
    if (!withContexts.length) return [];
    let shared = new Set(withContexts[0]);
    for (let i = 1; i < withContexts.length && shared.size > 0; i++) {
      const ids = new Set(withContexts[i]);
      shared = new Set([...shared].filter((id) => ids.has(id)));
    }
    return [...shared].sort();
  }, [selected, connections]);
  const mixedContexts =
    selected.some((id) => (connections.find((c) => c.id === id)?.contextIds.length ?? 0) > 0) &&
    sharedContextIds.length === 0;
  const resolvedContext = sharedContextIds.length > 0
    ? contexts.find((c) => c.id === sharedContextIds[0])
    : undefined;

  const generate = () => {
    if (!prompt.trim()) {
      toast.error('Enter a prompt for AI');
      return;
    }
    if (mixedContexts) {
      toast.error('Selected connections use different AI contexts');
      return;
    }
    generateWithAi.mutate(
      {
        prompt: prompt.trim(),
        connectionIds: selected,
        generateImage,
      },
      {
        onSuccess: (res) => {
          const post = res.data.post;
          setTitle(post.title);
          setContent(post.content);
          setCategory(post.category);
          setTags(post.tags.join(', '));
          setImages(post.images || []);
          toast.success(
            post.images?.length
              ? `Draft + ${post.images.length} image${post.images.length === 1 ? '' : 's'} generated — review and publish`
              : 'Draft generated — review and publish',
          );
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
    if (publish && selected.length === 0) {
      toast.error('Select at least one connection to publish');
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
        connectionIds: selected,
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

  return (
    <div className="max-w-6xl space-y-4">
      <h1 className="sd-display text-xl font-bold">Compose</h1>

      {connections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-purple-200 p-6 text-center text-sm text-[var(--sd-muted)]">
          Connect a platform first. For Community, create a developer key at{' '}
          <a
            href="https://community.timetofuture.com/developer"
            target="_blank"
            rel="noreferrer"
            className="text-purple-600 font-medium hover:underline"
          >
            Community → Developer
          </a>
          , then paste it in{' '}
          <Link to="/connections" className="text-purple-600 font-medium">
            Connections
          </Link>
          .
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-600">Publish to</p>
          <div className="flex flex-wrap gap-2">
            {connections.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  selected.includes(c.id)
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[var(--sd-muted)]">
            {mixedContexts ? (
              <span className="text-amber-700">
                Selected connections use different AI contexts — pick connections from a single
                context to generate with AI, or generate separately for each.
              </span>
            ) : resolvedContext ? (
              `Using context "${resolvedContext.name}" and your recent posts so drafts stay original (no duplicates).`
            ) : hasAi ? (
              <>
                Tip: create an{' '}
                <Link to="/contexts" className="text-purple-600 hover:underline">
                  AI context
                </Link>{' '}
                (who you are, topics, image style) and assign it to a connection for better drafts.
              </>
            ) : (
              'Select platforms before generating with AI so the draft matches each one.'
            )}
          </p>
        </div>
      )}

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
          <label className="flex items-start gap-2 text-xs text-violet-900 cursor-pointer">
            <input
              type="checkbox"
              checked={generateImage}
              onChange={(e) => setGenerateImage(e.target.checked)}
              className="mt-0.5 rounded border-violet-300"
            />
            <span>
              Also generate 1–4 images (picked at random)
              {resolvedContext?.imageStyle
                ? ` in your saved style (“${resolvedContext.imageStyle.slice(0, 60)}${
                    resolvedContext.imageStyle.length > 60 ? '…' : ''
                  }”)`
                : ''}{' '}
              (uses your OpenAI Images quota). Set style on the AI Contexts page.
            </span>
          </label>
          <button
            type="button"
            onClick={generate}
            disabled={generateWithAi.isPending || !prompt.trim() || mixedContexts}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50"
          >
            {generateWithAi.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {generateImage ? 'Generating draft + image…' : 'Generating…'}
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
          Connect OpenAI in{' '}
          <Link to="/connections" className="text-purple-600 font-medium hover:underline">
            Connections → AI Assistant
          </Link>{' '}
          to generate posts from a prompt.
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
    </div>
  );
}
