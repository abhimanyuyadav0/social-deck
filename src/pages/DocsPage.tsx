import { Link } from 'react-router-dom';
import { BookOpen, Users, Linkedin, Youtube, Instagram, Sparkles, Film } from 'lucide-react';
import {
  CommunityGuideContent,
  LinkedInGuideContent,
  YouTubeGuideContent,
  InstagramGuideContent,
  AiGuideContent,
} from '@/components/ConnectorHelpModals';

const toc = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'community', label: 'Community', icon: Users },
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
            Each platform in the sidebar — LinkedIn, Instagram, YouTube, Community — has its own
            dedicated page with everything for that platform: connect once, then briefing,
            schedule, compose, and post history all live together on that same page. Nothing is
            shared or mixed across platforms.
          </p>
          <ol className="list-decimal pl-4 space-y-1.5 text-xs text-gray-600">
            <li>
              Click a platform in the sidebar (e.g.{' '}
              <Link to="/linkedin" className="text-purple-700 hover:underline">
                LinkedIn
              </Link>
              ) and connect it — Community uses a developer key (
              <code className="text-purple-700">cm_...</code>), the others use OAuth.
            </li>
            <li>
              Once connected, fill in the <strong>Briefing &amp; Auto Run</strong> tab (who you
              are, goals, voice, topics, image style) — this powers both AI drafts and scheduled
              posts for that connection. Saving it for the first time creates the briefing
              automatically; there&apos;s no separate setup step.
            </li>
            <li>
              Use the <strong>Photo &amp; Text Post</strong> tab to write manually or generate a
              draft with AI (optionally with 1–4 AI images), then publish or save as a draft.
            </li>
            <li>
              Turn on Auto Run in the Briefing tab to have it generate and publish on a schedule,
              picking a new topic each time so posts stay varied.
            </li>
            <li>
              Check what&apos;s gone out in the <strong>Post history</strong> tab, including
              retrying anything that failed.
            </li>
          </ol>
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
          id="instagram"
          className="scroll-mt-4 rounded-xl border border-[var(--sd-line)] bg-white p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
              <Instagram className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-semibold text-gray-900">Instagram Login</h2>
              <p className="text-xs text-[var(--sd-muted)]">
                No Facebook Page needed — Business or Creator account required
              </p>
            </div>
          </div>
          <InstagramGuideContent />
          <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2.5 flex items-start gap-2">
            <Film className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
            <p className="text-xs text-violet-900 leading-relaxed">
              Instagram is the only platform that supports <strong>multiple accounts</strong> —
              the Instagram page shows every account you&apos;ve connected as its own card, plus a
              &quot;Connect another account&quot; option, each with its own separate briefing,
              schedule, and post history. It also has an extra <strong>Video Reel Series</strong>{' '}
              tab: upload one video of any length, size, or shape, choose a clip length, and it's
              auto-cut and posted as a sequence of Reels on a schedule.
            </p>
          </div>
        </section>

        <section
          id="youtube"
          className="scroll-mt-4 rounded-xl border border-[var(--sd-line)] bg-white p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Youtube className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-semibold text-gray-900">YouTube</h2>
              <p className="text-xs text-[var(--sd-muted)]">Connect only — publishing not yet supported</p>
            </div>
          </div>
          <YouTubeGuideContent />
          <p className="text-xs text-gray-500 leading-relaxed">
            YouTube requires an actual video file to publish, and Social Deck doesn&apos;t
            generate video for YouTube yet — so its page only has connect/reconnect/disconnect
            for now, no briefing, compose, or post history.
          </p>
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
              <p className="text-xs text-[var(--sd-muted)]">Community by Time To Future</p>
            </div>
          </div>
          <CommunityGuideContent />
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
              <h2 className="font-semibold text-gray-900">AI drafts (OpenAI)</h2>
              <p className="text-xs text-[var(--sd-muted)]">Powers Photo & Text Post and Auto Run</p>
            </div>
          </div>
          <AiGuideContent />
          <p className="text-xs text-gray-500 leading-relaxed">
            Connect it once from the{' '}
            <Link to="/" className="text-purple-700 hover:underline">
              Dashboard
            </Link>{' '}
            — it&apos;s shared across every platform, not tied to any one of them.
          </p>
        </section>
      </div>
    </div>
  );
}
