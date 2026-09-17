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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/linkedin', label: 'LinkedIn', icon: Linkedin },
  { to: '/instagram', label: 'Instagram', icon: Instagram },
  { to: '/facebook', label: 'Facebook', icon: Facebook },
  { to: '/youtube', label: 'YouTube', icon: Youtube },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/ai-models', label: 'AI Models', icon: Sparkles },
  { to: '/docs', label: 'Docs', icon: BookOpen },
];

function initialsFor(email?: string | null) {
  if (!email) return '?';
  const name = email.split('@')[0];
  const parts = name.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function Layout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);

  // Close the mobile drawer whenever the route changes (e.g. after tapping a nav link).
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-dvh flex overflow-hidden bg-[var(--sd-app-bg)]">
      {sidebarOpen && (
        <div
          aria-hidden
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[var(--sd-ink)]/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-60 shrink-0 h-full border-r border-[var(--sd-line-soft)] bg-white flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="h-16 shrink-0 px-4 flex items-center justify-between gap-2 border-b border-[var(--sd-line-soft)]">
          <span className="flex items-center gap-2.5">
            <span
              className="sd-icon-badge w-9 h-9 text-white shrink-0"
              style={{ background: 'var(--sd-accent-grad)', boxShadow: '0 6px 16px -6px rgba(147,51,234,0.5)' }}
            >
              <Share2 className="w-4 h-4" />
            </span>
            <span className="font-bold tracking-tight sd-display text-[15px] text-[var(--sd-ink)]">
              Social Deck
            </span>
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-[var(--sd-muted)] hover:bg-[var(--sd-surface-alt)] lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--sd-subtle)]">
            Menu
          </p>
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sd-nav-link flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'text-[var(--sd-accent-ink)] font-semibold'
                    : 'text-[var(--sd-muted)] hover:bg-[var(--sd-surface-alt)] hover:text-[var(--sd-ink)]'
                }`
              }
              style={({ isActive }) => (isActive ? { background: 'var(--sd-accent-grad-soft)' } : undefined)}
              data-active={location.pathname === to || (to !== '/' && location.pathname.startsWith(to))}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 shrink-0 border-t border-[var(--sd-line-soft)]">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
            <span
              className="sd-icon-badge w-8 h-8 text-xs font-bold text-white shrink-0"
              style={{ background: 'var(--sd-accent-grad)' }}
            >
              {initialsFor(user?.email)}
            </span>
            <span className="text-xs text-[var(--sd-muted)] truncate min-w-0">{user?.email}</span>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="h-16 shrink-0 border-b border-[var(--sd-line-soft)] bg-white/85 backdrop-blur-md flex items-center justify-between px-3 sm:px-5 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 rounded-lg text-[var(--sd-muted)] hover:bg-[var(--sd-surface-alt)] lg:hidden shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="flex items-center gap-2 lg:hidden min-w-0">
              <span
                className="sd-icon-badge w-7 h-7 text-white shrink-0"
                style={{ background: 'var(--sd-accent-grad)' }}
              >
                <Share2 className="w-3.5 h-3.5" />
              </span>
              <span className="font-semibold tracking-tight sd-display truncate">Social Deck</span>
            </span>
          </div>
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-[var(--sd-line-soft)] hover:border-[var(--sd-line)] hover:bg-[var(--sd-surface-alt)] transition-colors"
              aria-label="User menu"
            >
              <span
                className="sd-icon-badge w-7 h-7 text-[11px] font-bold text-white"
                style={{ background: 'var(--sd-accent-grad)' }}
              >
                {initialsFor(user?.email)}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--sd-muted)] transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 sd-modal-panel py-1.5 z-50">
                <div className="px-3.5 py-2 border-b border-[var(--sd-line-soft)]">
                  <p className="text-xs font-semibold text-[var(--sd-ink)] truncate">{user?.email}</p>
                  <p className="text-[11px] text-[var(--sd-subtle)] mt-0.5">Signed in</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-[var(--sd-muted)] hover:bg-rose-50 hover:text-rose-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 min-h-0 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
