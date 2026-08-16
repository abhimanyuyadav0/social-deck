import { useEffect, useState } from 'react';
import type { AiProfile } from '@/api/services/socialDeck';

const IMAGE_STYLES = [
  'Flat vector illustration',
  'Photorealistic',
  'Minimal geometric',
  '3D render',
  'Hand-drawn sketch',
  'Cinematic dark',
];

export type AiBriefingValues = Partial<AiProfile> & {
  topicsText: string;
  promptHint: string;
  generateImage: boolean;
};

export default function AiContextForm({
  initial,
  topicsText: initialTopics = '',
  promptHint: initialHint = '',
  generateImage: initialGenerateImage = false,
  onSave,
  pending,
}: {
  initial: AiProfile;
  topicsText?: string;
  promptHint?: string;
  generateImage?: boolean;
  onSave: (values: AiBriefingValues) => void;
  pending: boolean;
}) {
  const [aboutYou, setAboutYou] = useState(initial.aboutYou);
  const [goals, setGoals] = useState(initial.goals);
  const [references, setReferences] = useState(initial.references);
  const [voice, setVoice] = useState(initial.voice);
  const [audience, setAudience] = useState(initial.audience);
  const [imageStyle, setImageStyle] = useState(initial.imageStyle || '');
  const [topicsText, setTopicsText] = useState(initialTopics);
  const [promptHint, setPromptHint] = useState(initialHint);
  const [generateImage, setGenerateImage] = useState(initialGenerateImage);

  useEffect(() => {
    setAboutYou(initial.aboutYou);
    setGoals(initial.goals);
    setReferences(initial.references);
    setVoice(initial.voice);
    setAudience(initial.audience);
    setImageStyle(initial.imageStyle || '');
  }, [initial]);

  useEffect(() => {
    setTopicsText(initialTopics);
    setPromptHint(initialHint);
    setGenerateImage(initialGenerateImage);
  }, [initialTopics, initialHint, initialGenerateImage]);

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold text-violet-900">AI briefing</p>
        <p className="text-xs text-[var(--sd-muted)] mt-0.5">
          One place for who you are, topics, instructions, and image style. AI uses this for Compose
          and Auto Run.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="text-xs font-medium text-gray-600">Who you are</span>
          <textarea
            rows={2}
            value={aboutYou}
            onChange={(e) => setAboutYou(e.target.value)}
            placeholder="e.g. Full-stack developer at Acme, 5 yrs React/Node, building in public…"
            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-y"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-600">What you&apos;re trying to accomplish</span>
          <textarea
            rows={2}
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="e.g. Grow Community following, share learning notes, promote my SaaS…"
            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-y"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-600">References</span>
          <textarea
            rows={3}
            value={references}
            onChange={(e) => setReferences(e.target.value)}
            placeholder="Links, projects, stats, talking points — one per line&#10;https://myapp.com&#10;Shipped v2 last week with 40% faster builds"
            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-y font-mono text-[13px]"
          />
        </label>
        <div className="grid sm:grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Voice / tone</span>
            <input
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              placeholder="Friendly, direct, no jargon"
              className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-600">Audience</span>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Developers, founders, students…"
              className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
            />
          </label>
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-violet-100">
        <label className="block">
          <span className="text-xs font-medium text-gray-600">Topics</span>
          <p className="text-[11px] text-[var(--sd-muted)] mt-0.5 mb-1">
            One theme per line. Auto Run rotates through these so posts stay varied.
          </p>
          <textarea
            rows={4}
            value={topicsText}
            onChange={(e) => setTopicsText(e.target.value)}
            placeholder={'Developer productivity tips\nLessons from shipping features\nCommunity building'}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-y"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-600">Standing instructions</span>
          <textarea
            rows={2}
            value={promptHint}
            onChange={(e) => setPromptHint(e.target.value)}
            placeholder="e.g. Keep under 400 words, end with a question"
            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-y"
          />
        </label>
      </div>

      <div className="space-y-2 pt-1 border-t border-violet-100">
        <label className="block">
          <span className="text-xs font-medium text-gray-600">Image style</span>
          <p className="text-[11px] text-[var(--sd-muted)] mt-0.5 mb-1">
            Describe the look you want when AI generates an image.
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {IMAGE_STYLES.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() =>
                  setImageStyle((prev) => (prev === style ? '' : style))
                }
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                  imageStyle === style
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-violet-300'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
          <textarea
            rows={2}
            value={imageStyle}
            onChange={(e) => setImageStyle(e.target.value)}
            placeholder="e.g. Flat vector illustration, purple and white, no people, clean workspace scene"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm resize-y"
          />
        </label>
        <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={generateImage}
            onChange={(e) => setGenerateImage(e.target.checked)}
            className="mt-0.5 rounded border-gray-300"
          />
          <span>
            Include an AI image with each Auto Run post (OpenAI Images + Cloudinary; billed to your
            OpenAI account). Compose can still toggle this per draft.
          </span>
        </label>
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={() =>
          onSave({
            aboutYou,
            goals,
            references,
            voice,
            audience,
            imageStyle,
            topicsText,
            promptHint,
            generateImage,
          })
        }
        className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save AI briefing'}
      </button>
    </div>
  );
}
