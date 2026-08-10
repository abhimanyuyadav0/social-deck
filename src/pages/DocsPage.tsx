import { Link } from 'react-router-dom';
import { BookOpen, Users, Linkedin, Sparkles, Link2 } from 'lucide-react';
import {
  CommunityGuideContent,
  LinkedInGuideContent,
  AiGuideContent,
} from '@/components/ConnectorHelpModals';

const toc = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'ai', label: 'AI (OpenAI)', icon: Sparkles },
] as const;

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto flex gap-8 items-start">
      <aside className="hidden lg:block w-44 shrink-0 sticky top-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--sd-muted)] mb-2">
          On this page
        </p>
        <nav className="space-y-0.5">
          {toc.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--sd-muted)] hover:bg-purple-50 hover:text-purple-800"
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </a>
          ))}
        </nav>
        <Link
          to="/connections"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-purple-700 hover:underline"
        >
          <Link2 className="w-3.5 h-3.5" />
          Open Connections
        </Link>
      </aside>

      <div className="flex-1 min-w-0 space-y-8">
        <div>
          <h1 className="sd-display text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Docs
          </h1>
          <p className="text-sm text-[var(--sd-muted)] mt-1">
            Step-by-step guides for every Social Deck connector.
          </p>
          <div className="flex flex-wrap gap-2 mt-3 lg:hidden">
            {toc.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs text-gray-600 hover:bg-purple-50 hover:text-purple-800"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <section
          id="overview"
          className="scroll-mt-4 rounded-xl border border-[var(--sd-line)] bg-white p-5 space-y-3"
        >
          <h2 className="font-semibold text-gray-900">Overview</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Connect platforms once, then pick them in Compose when you publish. Community uses a
            developer key (<code className="text-purple-700">cm_...</code>), LinkedIn uses OAuth, and
            AI uses your OpenAI key.
          </p>
          <ol className="list-decimal pl-4 space-y-1.5 text-xs text-gray-600">
            <li>
              Open{' '}
              <Link to="/connections" className="text-purple-700 hover:underline">
                Connections
              </Link>{' '}
              and set up each connector you need.
            </li>
            <li>
              Optionally fill AI context on{' '}
              <Link to="/auto" className="text-purple-700 hover:underline">
                Auto Run
              </Link>{' '}
              so generated drafts match your voice (used for Compose and Auto Run).
            </li>
            <li>
              In Compose, optionally enable image generation (OpenAI Images; requires Cloudinary on
              the API). Auto Run has the same toggle for scheduled posts.
            </li>
            <li>
              Use{' '}
              <Link to="/compose" className="text-purple-700 hover:underline">
                Compose
              </Link>{' '}
              to write or generate a post and publish to selected connections.
            </li>
            <li>
              Optional:{' '}
              <Link to="/auto" className="text-purple-700 hover:underline">
                Auto Run
              </Link>{' '}
              schedules AI-generated posts on an interval.
            </li>
          </ol>
        </section>

        <section
          id="community"
          className="scroll-mt-4 rounded-xl border border-[var(--sd-line)] bg-white p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-semibold text-gray-900">Community</h2>
              <p className="text-xs text-[var(--sd-muted)]">Time To Future Community</p>
            </div>
          </div>
          <CommunityGuideContent />
        </section>

        <section
          id="linkedin"
          className="scroll-mt-4 rounded-xl border border-[var(--sd-line)] bg-white p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Linkedin className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-semibold text-gray-900">LinkedIn OAuth 2.0 Setup</h2>
              <p className="text-xs text-[var(--sd-muted)]">
                Developer app + end-user connect flow
              </p>
            </div>
          </div>
          <LinkedInGuideContent />
        </section>

        <section
          id="ai"
          className="scroll-mt-4 rounded-xl border border-[var(--sd-line)] bg-white p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-semibold text-gray-900">AI Assistant (OpenAI)</h2>
              <p className="text-xs text-[var(--sd-muted)]">Draft posts from prompts</p>
            </div>
          </div>
          <AiGuideContent />
        </section>
      </div>
    </div>
  );
}
