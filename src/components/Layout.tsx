import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PenSquare,
  Link2,
  FileText,
  Bot,
  LogOut,
  Share2,
  User,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/compose', label: 'Compose', icon: PenSquare },
  { to: '/connections', label: 'Connections', icon: Link2 },
  { to: '/posts', label: 'Posts', icon: FileText },
  { to: '/auto', label: 'Auto Run', icon: Bot },
  { to: '/docs', label: 'Docs', icon: BookOpen },
];

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
    <div className="h-dvh flex overflow-hidden bg-[var(--sd-bg)]">
      {sidebarOpen && (
        <div
          aria-hidden
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-56 shrink-0 h-full border-r border-[var(--sd-line)] bg-white flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 shrink-0 px-4 flex items-center justify-between gap-2 border-b border-[var(--sd-line)]">
          <span className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </span>
            <span className="font-semibold tracking-tight sd-display">Social Deck</span>
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-[var(--sd-muted)] hover:bg-purple-50 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-50 text-purple-800'
                    : 'text-[var(--sd-muted)] hover:bg-purple-50/50 hover:text-[var(--sd-ink)]'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 shrink-0 border-t border-[var(--sd-line)] text-xs text-[var(--sd-muted)] truncate">
          {user?.email}
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="h-14 shrink-0 border-b border-[var(--sd-line)] bg-white/80 backdrop-blur flex items-center justify-between px-3 sm:px-4 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 rounded-lg text-[var(--sd-muted)] hover:bg-purple-50 lg:hidden shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="flex items-center gap-2 lg:hidden min-w-0">
              <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Share2 className="w-3.5 h-3.5" />
              </span>
              <span className="font-semibold tracking-tight sd-display truncate">Social Deck</span>
            </span>
          </div>
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="w-9 h-9 rounded-full border border-[var(--sd-line)] flex items-center justify-center text-[var(--sd-muted)] hover:bg-purple-50"
              aria-label="User menu"
            >
              <User className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[var(--sd-line)] bg-white shadow-lg py-1 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--sd-muted)] hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
