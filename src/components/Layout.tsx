import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Users,
  LogOut,
  Share2,
  Sparkles,
  BookOpen,
  Menu,
  X,
  ChevronDown,
  Cpu,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAiConfigs } from '@/api/services/socialDeck';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  brandColor?: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Workspace',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Channels',
    items: [
      { to: '/linkedin', label: 'LinkedIn', icon: Linkedin, brandColor: '#0a66c2' },
      { to: '/instagram', label: 'Instagram', icon: Instagram, brandColor: '#e1306c' },
      { to: '/facebook', label: 'Facebook', icon: Facebook, brandColor: '#1877f2' },
      { to: '/youtube', label: 'YouTube', icon: Youtube, brandColor: '#ef4444' },
      { to: '/community', label: 'Community', icon: Users, brandColor: '#8b5cf6' },
    ],
  },
  {
    title: 'AI Engine',
    items: [
      { to: '/ai-models', label: 'AI Models', icon: Sparkles, brandColor: '#6366f1', badge: 'Auto' },
    ],
  },
  {
    title: 'Support',
    items: [{ to: '/docs', label: 'Documentation', icon: BookOpen }],
  },
];

function initialsFor(email?: string | null) {
  if (!email) return '?';
  const name = email.split('@')[0];
  const parts = name.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getPageTitle(pathname: string) {
  if (pathname === '/') return 'Overview & Analytics';
  if (pathname.startsWith('/linkedin')) return 'LinkedIn Channel';
  if (pathname.startsWith('/instagram')) return 'Instagram Accounts';
  if (pathname.startsWith('/facebook')) return 'Facebook Pages';
  if (pathname.startsWith('/youtube')) return 'YouTube Studio';
  if (pathname.startsWith('/community')) return 'Community Hub';
  if (pathname.startsWith('/ai-models')) return 'AI Model Routing';
  if (pathname.startsWith('/docs')) return 'API & Setup Docs';
  return 'Dashboard';
}

export default function Layout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: aiData } = useAiConfigs();
  const configs = aiData?.data?.configs ?? [];
  const defaultAi = configs.find((c) => c.isDefault) ?? configs[0];

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="h-dvh flex overflow-hidden bg-[var(--sd-app-bg)]">
      {sidebarOpen && (
        <div
          aria-hidden
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 shrink-0 h-full border-r border-slate-200/80 bg-white/95 backdrop-blur-xl flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        {/* Brand Header */}
        <div className="h-16 shrink-0 px-4 flex items-center justify-between gap-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className="sd-icon-badge w-9 h-9 text-white shrink-0 shadow-md"
              style={{
                background: 'var(--sd-accent-grad)',
                boxShadow: '0 4px 14px -3px rgba(99, 102, 241, 0.5)',
              }}
            >
              <Share2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight sd-display text-[15px] text-[var(--sd-ink)] flex items-center gap-1.5">
                Social Deck
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                  PRO
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium -mt-0.5">By Time To Future</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categorized Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              {section.items.map(({ to, label, icon: Icon, end, brandColor, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `sd-nav-link flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold group ${isActive
                      ? 'text-indigo-600 bg-indigo-50/70 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                  data-active={location.pathname === to || (to !== '/' && location.pathname.startsWith(to))}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="p-1 rounded-lg transition-colors group-hover:scale-110 duration-150"
                      style={brandColor ? { color: brandColor } : undefined}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span>{label}</span>
                  </div>
                  {badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-indigo-100/70 text-indigo-700">
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User Footer Card */}
        <div className="p-3 shrink-0 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="sd-icon-badge w-8 h-8 text-xs font-bold text-white shrink-0 relative"
                style={{ background: 'var(--sd-accent-grad)' }}
              >
                {initialsFor(user?.email)}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="h-16 shrink-0 border-b border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 gap-3 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight truncate">
                {pageTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Live AI Engine Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs">
              <div className="sd-pulse-dot bg-emerald-500" />
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Cpu className="w-3 h-3 text-indigo-500" />
                <span>AI:</span>
                <strong className="text-slate-800 capitalize">
                  {defaultAi ? defaultAi.provider : 'Not linked'}
                </strong>
              </span>
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
                aria-label="User menu"
              >
                <div
                  className="sd-icon-badge w-7 h-7 text-[11px] font-bold text-white shadow-xs"
                  style={{ background: 'var(--sd-accent-grad)' }}
                >
                  {initialsFor(user?.email)}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 sd-modal-panel py-1.5 z-50 border border-slate-200 shadow-xl">
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{user?.email}</p>
                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active Session
                    </p>
                  </div>
                  <NavLink
                    to="/ai-models"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    AI Model Settings
                  </NavLink>
                  <NavLink
                    to="/docs"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    Developer Docs
                  </NavLink>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 p-2 sm:p-4 lg:p-4 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
