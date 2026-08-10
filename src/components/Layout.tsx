import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
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
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <div className="h-dvh flex overflow-hidden bg-[var(--sd-bg)]">
      <aside className="w-56 shrink-0 h-full border-r border-[var(--sd-line)] bg-white flex flex-col">
        <div className="h-14 shrink-0 px-4 flex items-center gap-2 border-b border-[var(--sd-line)]">
          <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
            <Share2 className="w-4 h-4" />
          </span>
          <span className="font-semibold tracking-tight sd-display">Social Deck</span>
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
        <header className="h-14 shrink-0 border-b border-[var(--sd-line)] bg-white/80 backdrop-blur flex items-center justify-end px-4 gap-2">
          <div className="relative" ref={menuRef}>
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
        <main className="flex-1 min-h-0 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
