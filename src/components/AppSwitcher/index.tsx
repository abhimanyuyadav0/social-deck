import { useState, useRef, useEffect } from 'react';
import { LayoutGrid, X } from 'lucide-react';
import { useTheme } from 'glintly-ui';
import { useCommonApps, type CommonApp } from '@/api/services/common';
import { getAppIcon } from './iconMap';

const CURRENT_APP_ID = 'social-deck';

/** Map glintly theme to AppSwitcher expected shape */
function useAppSwitcherTheme() {
  const { theme: glintlyTheme } = useTheme();
  const bg = glintlyTheme?.colors?.background;
  const text = glintlyTheme?.colors?.text;
  const primary =
    glintlyTheme?.colors?.semantic?.primary?.[500] ?? glintlyTheme?.colors?.primary?.[500];
  const border = glintlyTheme?.colors?.border?.default;
  return {
    theme: {
      colors: {
        bgDark: bg?.base ?? 'var(--bg-dark)',
        bgCard: bg?.surface ?? bg?.elevated ?? 'var(--bg-card)',
        bgGlass: 'rgba(255, 255, 255, 0.04)',
        textPrimary: text?.primary ?? 'var(--text-primary)',
        textSecondary: text?.secondary ?? 'var(--text-secondary)',
        primary: primary ?? 'var(--primary)',
        borderColor: border ?? 'var(--border-color)',
      },
    },
  };
}

interface App {
  id: string;
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  external?: boolean;
  current?: boolean;
}

function mapApiAppsToDisplay(apiApps: CommonApp[], currentAppId: string): App[] {
  return apiApps.map((app) => ({
    id: app.id,
    name: app.name,
    path: app.path,
    icon: getAppIcon(app.icon),
    description: app.description,
    color: app.color,
    external: app.external,
    current: app.id === currentAppId,
  }));
}

export function AppSwitcher() {
  const { theme } = useAppSwitcherTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: apiApps, isLoading, isError } = useCommonApps();
  const apps: App[] =
    apiApps && apiApps.length > 0 ? mapApiAppsToDisplay(apiApps, CURRENT_APP_ID) : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
        setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredApps = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-300"
        style={{
          backgroundColor: isOpen ? theme.colors.bgGlass : 'transparent',
          color: theme.colors.textSecondary,
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = theme.colors.bgGlass;
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = 'transparent';
        }}
        aria-label="Switch app"
      >
        <LayoutGrid className="w-5 h-5 transition-colors duration-300" />
      </button>
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-80 rounded-xl shadow-xl overflow-hidden z-[1000] transition-all duration-300"
          style={{
            backgroundColor: theme.colors.bgCard,
            border: `1px solid ${theme.colors.borderColor}`,
            boxShadow: `0 10px 25px ${theme.colors.bgGlass}88`,
          }}
        >
          <div
            className="p-4 border-b transition-colors duration-300"
            style={{ borderColor: theme.colors.borderColor }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm transition-all duration-300"
                style={{
                  backgroundColor: theme.colors.bgDark,
                  borderColor: theme.colors.borderColor,
                  color: theme.colors.textPrimary,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary;
                  e.target.style.boxShadow = `0 0 0 2px ${theme.colors.primary}33`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.borderColor;
                  e.target.style.boxShadow = 'none';
                }}
                autoFocus
              />
              <LayoutGrid
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: theme.colors.textSecondary }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: theme.colors.textSecondary }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center">
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  Loading apps...
                </p>
              </div>
            ) : apps.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  {isError ? 'Unable to load apps. Please try again.' : 'No apps available.'}
                </p>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  No apps found
                </p>
              </div>
            ) : (
              filteredApps.map((app) => {
                const isActive = app.current === true;
                const content = (
                  <>
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${app.color} flex items-center justify-center text-white flex-shrink-0 transition-transform duration-300 hover:scale-110`}
                    >
                      {app.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-semibold text-sm transition-colors duration-300"
                        style={{
                          color: isActive ? theme.colors.primary : theme.colors.textPrimary,
                        }}
                      >
                        {app.name}
                      </div>
                      <div
                        className="text-xs truncate transition-colors duration-300"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {app.description}
                      </div>
                    </div>
                    {app.external && (
                      <span className="text-[10px] text-zinc-500">Opens in new tab</span>
                    )}
                    {isActive && (
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                    )}
                  </>
                );
                if (app.current) {
                  return (
                    <div
                      key={app.id}
                      className="flex items-center gap-3 p-4 w-full text-left border-b last:border-b-0"
                      style={{
                        backgroundColor: theme.colors.bgGlass,
                        borderColor: theme.colors.borderColor,
                      }}
                    >
                      {content}
                    </div>
                  );
                }
                return (
                  <a
                    key={app.id}
                    href={app.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-4 w-full text-left transition-colors duration-300 border-b last:border-b-0"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: theme.colors.borderColor,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.bgGlass;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {content}
                  </a>
                );
              })
            )}
          </div>
          <div
            className="p-4 border-t transition-colors duration-300"
            style={{ borderColor: theme.colors.borderColor, backgroundColor: theme.colors.bgDark }}
          >
            <div
              className="text-xs font-semibold mb-2 uppercase tracking-wide"
              style={{ color: theme.colors.textSecondary }}
            >
              Quick Links
            </div>
            <a
              href="https://timetofuture.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="text-xs px-3 py-1.5 rounded-md border transition-all duration-300"
              style={{
                backgroundColor: theme.colors.bgCard,
                borderColor: theme.colors.borderColor,
                color: theme.colors.textSecondary,
              }}
            >
              Time To Future Home
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
