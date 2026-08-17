import { Link } from 'react-router-dom';
import { Share2, Sparkles, Zap, Layers, ArrowRight, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Connect platforms',
    body: 'Link Community, LinkedIn, YouTube, and Instagram once — publish under your own accounts from a single place.',
  },
  {
    icon: Sparkles,
    title: 'Write with AI',
    body: 'Draft posts from a prompt, tuned to your voice, goals, and past content — with optional AI images.',
  },
  {
    icon: Zap,
    title: 'Auto Run',
    body: 'Give each AI context its own schedule so it keeps generating and posting on a timer, hands-free.',
  },
];

const dataUse = [
  {
    platform: 'Community by Time To Future',
    reason:
      'You paste a developer key you create yourself. We use it only to publish posts under your Community profile — nothing else.',
  },
  {
    platform: 'LinkedIn',
    reason:
      'OAuth grants read of your basic profile (to show who you’re connected as) and permission to publish posts you write, on your behalf. We never post without you generating or writing the content first.',
  },
  {
    platform: 'YouTube (Google)',
    reason:
      'OAuth reads your channel’s basic info so we can show which channel is connected. We also request upload permission for a publishing feature that isn’t live yet — today, we don’t upload or change anything on your channel.',
  },
  {
    platform: 'Instagram',
    reason:
      'OAuth reads your Instagram Business/Creator account’s basic info and grants permission to publish image posts you create, on your behalf. We never post without you generating or writing the content first.',
  },
  {
    platform: 'OpenAI',
    reason:
      'You provide your own API key. We use it only to generate the draft text/images you ask for; billing stays on your OpenAI account and we never share the key.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--sd-bg)]">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 10% 20%, rgba(168,85,247,0.18), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, rgba(217,70,239,0.12), transparent 50%), linear-gradient(165deg, #faf5ff 0%, #f3e8ff 45%, #fdf4ff 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n\' opacity=\'0.45\'/%3E%3C/svg%3E")',
          backgroundSize: '180px 180px',
          mixBlendMode: 'multiply',
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="max-w-5xl mx-auto px-4 sm:px-8 py-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/25 group-hover:scale-105 transition-transform">
              <Share2 className="w-4 h-4" />
            </span>
            <span className="sd-display text-xl font-bold tracking-tight text-[var(--sd-ink)]">
              Social Deck
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold text-[var(--sd-ink)] hover:bg-white/60 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="px-3 sm:px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/20"
            >
              Sign up
            </Link>
          </div>
        </header>

        {/* Hero */}
        <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-10 pb-16 sm:pt-16 sm:pb-24">
          <div className="max-w-2xl">
            <h1 className="sd-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] text-[var(--sd-ink)]">
              Social Deck
            </h1>
            <p className="mt-4 text-lg sm:text-xl font-medium text-[var(--sd-ink)]/90 leading-snug max-w-xl">
              AI-powered social media management platform for creating, scheduling, and
              publishing content across your connected social accounts.
            </p>
            <p className="mt-3 text-sm text-[var(--sd-muted)]">
              Social Deck is a product by Time To Future.
            </p>
            <p className="mt-6 text-base text-[var(--sd-muted)] leading-relaxed max-w-xl">
              Connect Community, LinkedIn, YouTube, and Instagram, draft posts with AI in your own
              voice, and let Auto Run keep publishing on a schedule — so you stop copy-pasting the
              same update across apps.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 active:scale-[0.99] transition shadow-md shadow-purple-600/20"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-5 py-3 rounded-xl border border-purple-200 bg-white/80 text-[var(--sd-ink)] text-sm font-semibold hover:bg-white transition"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 sm:mt-20 grid sm:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-purple-100/80 bg-white/80 backdrop-blur-sm p-5 shadow-[0_20px_50px_-32px_rgba(88,28,135,0.35)]"
              >
                <span className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </span>
                <p className="font-semibold text-sm text-[var(--sd-ink)]">{f.title}</p>
                <p className="text-xs text-[var(--sd-muted)] mt-1.5 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>

          {/* Data use / permissions transparency */}
          <div className="mt-16 sm:mt-20 rounded-2xl border border-purple-100/80 bg-white/80 backdrop-blur-sm p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <h2 className="sd-display text-lg font-bold text-[var(--sd-ink)]">
                Why we ask for access
              </h2>
            </div>
            <p className="text-sm text-[var(--sd-muted)] mb-5 max-w-2xl">
              Social Deck only requests the permissions each connected platform needs to publish
              content you create — nothing is posted or changed on your accounts without your
              action.
            </p>
            <dl className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              {dataUse.map((d) => (
                <div key={d.platform}>
                  <dt className="text-sm font-semibold text-[var(--sd-ink)]">{d.platform}</dt>
                  <dd className="text-xs text-[var(--sd-muted)] mt-1 leading-relaxed">
                    {d.reason}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </main>

        <footer className="max-w-5xl mx-auto px-4 sm:px-8 pb-10">
          <p className="text-xs text-[var(--sd-muted)]">
            A Time To Future product · Separate account from Community / HRMS
          </p>
          <p className="text-xs text-[var(--sd-muted)] mt-2">
            <a
              href="https://timetofuture.com/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="text-purple-600 hover:underline"
            >
              Privacy Policy
            </a>
            {' · '}
            <a
              href="https://timetofuture.com/terms-of-service"
              target="_blank"
              rel="noreferrer"
              className="text-purple-600 hover:underline"
            >
              Terms of Service
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
