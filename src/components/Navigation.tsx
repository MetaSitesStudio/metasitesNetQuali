import { useEffect } from 'react';
import { Gauge, Clock, Settings as SettingsIcon, Wifi, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { getConnectionType, detectISP } from '../engine/utils';
import type { TabId } from '../types';

const tabs: { id: TabId; icon: typeof Gauge; labelKey: string }[] = [
  { id: 'dashboard', icon: Gauge, labelKey: 'nav.dashboard' },
  { id: 'history', icon: Clock, labelKey: 'nav.history' },
  { id: 'settings', icon: SettingsIcon, labelKey: 'nav.settings' },
];

export function Navigation() {
  const { t } = useTranslation();
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const connectionType = useStore((s) => s.connectionType);
  const ispName = useStore((s) => s.ispName);

  useEffect(() => {
    const ct = getConnectionType();
    useStore.getState().setConnectionType(ct);
    detectISP().then(({ isp }) => useStore.getState().setIspName(isp));
  }, []);

  return (
    <>
      {/* ====== DESKTOP NAV ====== */}
      <header className="desktop-nav nav-surface fixed top-0 left-0 right-0 z-50" style={{ height: 56 }}>
        <div
          className="flex items-center h-full mx-auto"
          style={{ maxWidth: 1320, paddingLeft: 40, paddingRight: 40 }}
        >
          {/* Brand */}
          <div className="flex items-center gap-2.5 mr-10 flex-shrink-0">
            <img src="/logo.png" alt="" className="w-7 h-7 rounded-md object-contain" />
            <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              MetaSites{' '}
              <span className="gradient-text">NetQual</span>
            </span>
          </div>

          {/* Tab nav — segmented pill style */}
          <nav
            className="flex items-center relative"
            style={{
              background: 'var(--bg-inset)',
              borderRadius: 'var(--radius-sm)',
              padding: 3,
              gap: 2,
            }}
          >
            {tabs.map(({ id, icon: Icon, labelKey }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="relative flex items-center gap-2 cursor-pointer border-none"
                  style={{
                    padding: '7px 18px',
                    borderRadius: 'var(--radius-xs)',
                    background: isActive ? 'var(--bg-panel)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.15s ease',
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{t(labelKey)}</span>
                </button>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Connection badge */}
          <div className="flex items-center gap-3">
            {connectionType !== 'unknown' && connectionType !== 'Unknown' && (
              <div
                className="flex items-center gap-1.5"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-inset)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                <Wifi size={12} style={{ color: 'var(--accent)' }} />
                {connectionType}
              </div>
            )}
            {ispName && ispName !== 'Unknown' && (
              <div
                className="flex items-center gap-1.5"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-tertiary)',
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <Globe size={12} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                <span className="truncate">{ispName}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ====== MOBILE BOTTOM NAV ====== */}
      <nav className="mobile-nav nav-surface fixed bottom-0 left-0 right-0 z-50"
        style={{ borderTop: '1px solid var(--border)', borderBottom: 'none', paddingBottom: 'env(safe-area-inset-bottom, 6px)' }}
      >
        <div className="flex items-center justify-around mx-auto px-6 py-1.5" style={{ maxWidth: 420 }}>
          {tabs.map(({ id, icon: Icon, labelKey }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="touch-target flex flex-col items-center gap-0.5 flex-1 py-1.5 bg-transparent border-none cursor-pointer transition-all duration-150"
                style={{
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  fontFamily: 'var(--font-sans)',
                }}
                aria-label={t(labelKey)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  style={{ color: isActive ? 'var(--accent)' : 'var(--text-tertiary)' }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
                  }}
                >
                  {t(labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
