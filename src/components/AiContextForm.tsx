import { useEffect, useState } from 'react';
import type { AiContext } from '@/api/services/socialDeck';
import AutoResizeTextarea from '@/components/AutoResizeTextarea';

const IMAGE_STYLES = [
  'Flat vector illustration',
  'Photorealistic',
  'Minimal geometric',
  '3D render',
  'Hand-drawn sketch',
  'Cinematic dark',
];

export type AiContextValues = Partial<AiContext> & { name: string };

export default function AiContextForm({
  initial,
  onSave,
  onCancel,
  pending,
}: {
  initial?: Partial<AiContext>;
  onSave: (values: AiContextValues) => void;
  onCancel?: () => void;
  pending: boolean;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [aboutYou, setAboutYou] = useState(initial?.aboutYou || '');
  const [goals, setGoals] = useState(initial?.goals || '');
  const [references, setReferences] = useState(initial?.references || '');
  const [voice, setVoice] = useState(initial?.voice || '');
  const [audience, setAudience] = useState(initial?.audience || '');
  const [imageStyle, setImageStyle] = useState(initial?.imageStyle || '');

  useEffect(() => {
    setName(initial?.name || '');
    setAboutYou(initial?.aboutYou || '');
    setGoals(initial?.goals || '');
    setReferences(initial?.references || '');
    setVoice(initial?.voice || '');
    setAudience(initial?.audience || '');
    setImageStyle(initial?.imageStyle || '');
  }, [initial]);

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-5 space-y-4">
      <div>
        <p className="text-sm font-semibold text-violet-900">AI context</p>
        <p className="text-xs text-[var(--sd-muted)] mt-0.5">
          Who you are, topics, and image style. Assign this context to one or more connections on
          the Connections page.
        </p>
      </div>

      <label className="block">
        <span className="text-xs font-medium text-gray-600">Context name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Personal brand, Company voice"
          className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
        />
      </label>

      <div className="space-y-2">
        <label className="block">
          <span className="text-xs font-medium text-gray-600">Who you are</span>
          <AutoResizeTextarea
            value={aboutYou}
            onChange={(e) => setAboutYou(e.target.value)}
            placeholder="e.g. Full-stack developer at Acme, 5 yrs React/Node, building in public…"
            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-600">What you&apos;re trying to accomplish</span>
          <AutoResizeTextarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="e.g. Grow Community following, share learning notes, promote my SaaS…"
            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-gray-600">References</span>
          <AutoResizeTextarea
            rows={3}
            value={references}
            onChange={(e) => setReferences(e.target.value)}
            placeholder="Links, projects, stats, talking points — one per line&#10;https://myapp.com&#10;Shipped v2 last week with 40% faster builds"
            className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-mono text-[13px]"
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
          <AutoResizeTextarea
            value={imageStyle}
            onChange={(e) => setImageStyle(e.target.value)}
            placeholder="e.g. Flat vector illustration, purple and white, no people, clean workspace scene"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          />
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending || !name.trim()}
          onClick={() =>
            onSave({
              name: name.trim(),
              aboutYou,
              goals,
              references,
              voice,
              audience,
              imageStyle,
            })
          }
          className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save AI context'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
