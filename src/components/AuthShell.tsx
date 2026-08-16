import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Share2, Sparkles, Zap, Layers } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Connect platforms',
    body: 'Authorize Community with a developer key — publish under your profile.',
  },
  {
    icon: Sparkles,
    title: 'Write with AI',
    body: 'Draft posts from a prompt, tuned to your voice, goals, and past content.',
  },
  {
    icon: Zap,
    title: 'Auto Run',
    body: 'Schedule generate-and-post on a timer so you stay consistent.',
  },
];

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

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

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        {/* Brand panel — always visible (stacks above the form on narrow screens) so the
            app's purpose is explained regardless of viewport, not just on desktop. */}
        <aside
          className={`flex flex-col justify-between gap-8 p-6 sm:p-10 xl:p-14 transition-all duration-700 ease-out ${
            ready ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          }`}
        >
          <Link to="/login" className="inline-flex items-center gap-3 w-fit group">
            <span className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/25 group-hover:scale-105 transition-transform">
              <Share2 className="w-5 h-5" />
            </span>
            <span className="sd-display text-2xl font-bold tracking-tight text-[var(--sd-ink)]">
              Social Deck
            </span>
          </Link>

          <div className="max-w-md space-y-6 lg:space-y-8">
            <div>
              <p className="sd-display text-3xl sm:text-4xl xl:text-5xl font-bold leading-[1.1] text-[var(--sd-ink)]">
                One place to compose.
                <span className="block text-purple-600 mt-1">Everywhere you publish.</span>
              </p>
              <p className="mt-4 text-[var(--sd-muted)] text-base leading-relaxed">
                Social Deck is a Time To Future product that lets you connect your social and
                Community accounts, draft posts with AI, and keep a steady posting rhythm — without
                copy-pasting the same update across apps.
              </p>
            </div>
            <ul className="space-y-4">
              {features.map((f, i) => (
                <li
                  key={f.title}
                  className={`flex gap-3 transition-all duration-700 ease-out ${
                    ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                  }`}
                  style={{ transitionDelay: `${150 + i * 90}ms` }}
                >
                  <span className="w-9 h-9 rounded-xl bg-white/80 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--sd-ink)]">{f.title}</p>
                    <p className="text-xs text-[var(--sd-muted)] mt-0.5 leading-relaxed">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-[var(--sd-muted)]">
            A Time To Future product · Separate account from Community / HRMS
          </p>
        </aside>

        {/* Form panel */}
        <main className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div
            className={`w-full max-w-[400px] transition-all duration-700 ease-out ${
              ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '80ms' }}
          >
            <div className="mb-6">
              <h1 className="sd-display text-2xl sm:text-3xl font-bold text-[var(--sd-ink)] tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-[var(--sd-muted)] mt-2 leading-relaxed">{subtitle}</p>
            </div>

            <div className="rounded-2xl border border-purple-100/80 bg-white/90 backdrop-blur-sm p-6 sm:p-7 shadow-[0_20px_50px_-28px_rgba(88,28,135,0.35)]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function AuthField({
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  placeholder,
  hint,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-[var(--sd-ink)]/80">{label}</label>
        {hint && <span className="text-[10px] text-[var(--sd-muted)]">{hint}</span>}
      </div>
      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-purple-100 bg-purple-50/30 text-sm text-[var(--sd-ink)] placeholder:text-gray-400 outline-none transition focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-purple-600 hover:text-purple-800"
          >
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
    </div>
  );
}
