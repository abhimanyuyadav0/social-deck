import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'glintly-ui';
import { Sparkles, Loader2 } from 'lucide-react';
import {
  useConnections,
  useCreatePost,
  useAiConfig,
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
  const createPost = useCreatePost();
  const generateWithAi = useGenerateWithAi();
  const connections = (data?.data?.connections ?? []).filter((c) => c.status === 'connected');
  const hasAi = !!aiData?.data?.ai?.connected;
  const hasAiContext = !!aiData?.data?.profile?.hasContext;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tags, setTags] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const generate = () => {
    if (!prompt.trim()) {
      toast.error('Enter a prompt for AI');
      return;
    }
    generateWithAi.mutate(
      { prompt: prompt.trim(), connectionIds: selected },
      {
        onSuccess: (res) => {
          const post = res.data.post;
          setTitle(post.title);
          setContent(post.content);
          setCategory(post.category);
          setTags(post.tags.join(', '));
          toast.success('Draft generated — review and publish');
        },
        onError: (e: Error) => toast.error(e.message),
      }
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
        category,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        connectionIds: selected,
        publish,
      },
      {
        onSuccess: () => {
          toast.success(publish ? 'Published!' : 'Saved as draft');
          if (publish) {
            setTitle('');
            setContent('');
            setTags('');
            setPrompt('');
          }
        },
        onError: (e: Error) => toast.error(e.message),
      }
    );
  };

  return (
    <div className="max-w-2xl space-y-4">
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
            {hasAiContext
              ? 'Uses your AI context and recent posts so drafts stay original (no duplicates).'
              : hasAi
                ? 'Tip: add who you are and references in Connections → AI context for better drafts.'
                : 'Select platforms before generating with AI so the draft matches each one.'}
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
            className="w-full px-3 py-2 rounded-xl border border-violet-200 bg-white text-sm resize-y"
          />
          <button
            type="button"
            onClick={generate}
            disabled={generateWithAi.isPending || !prompt.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50"
          >
            {generateWithAi.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating…
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
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
      />
      <textarea
        placeholder="Write your post…"
        rows={8}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-y"
      />
      <div className="grid sm:grid-cols-2 gap-3">
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
