import { useEffect, useState } from 'react';
import type { AiProfile } from '@/api/services/socialDeck';

export default function AiContextForm({
  initial,
  onSave,
  pending,
}: {
  initial: AiProfile;
  onSave: (profile: Partial<AiProfile>) => void;
  pending: boolean;
}) {
  const [aboutYou, setAboutYou] = useState(initial.aboutYou);
  const [goals, setGoals] = useState(initial.goals);
  const [references, setReferences] = useState(initial.references);
  const [voice, setVoice] = useState(initial.voice);
  const [audience, setAudience] = useState(initial.audience);

  useEffect(() => {
    setAboutYou(initial.aboutYou);
    setGoals(initial.goals);
    setReferences(initial.references);
    setVoice(initial.voice);
    setAudience(initial.audience);
  }, [initial]);

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-5 space-y-3">
      <div>
        <p className="text-sm font-semibold text-violet-900">Your AI context</p>
        <p className="text-xs text-[var(--sd-muted)] mt-0.5">
          Saved once — used for Compose, Auto Run, and every AI generation so drafts know who you
          are, your goals, and what to reference.
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
      <button
        type="button"
        disabled={pending}
        onClick={() => onSave({ aboutYou, goals, references, voice, audience })}
        className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save AI context'}
      </button>
    </div>
  );
}
