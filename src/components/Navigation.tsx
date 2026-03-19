import { useEffect } from 'react';
import { Gauge, Clock, Settings as SettingsIcon, Wifi, Globe, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { getConnectionType, detectISP } from '../engine/utils';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
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
  const { canInstall, install } = useInstallPrompt();

  useEffect(() => {
    const ct = getConnectionType();
    useStore.getState().setConnectionType(ct);
    detectISP().then(({ isp }) => useStore.getState().setIspName(isp));
  }, []);

  return (
    <>
      {/* ====== DESKTOP NAV ====== */}
      <header
        className="desktop-nav nav-surface fixed top-0 left-0 right-0 z-50"
        style={{ height: 64 }}
      >
        <div
          className="flex items-center h-full mx-auto"
          style={{ maxWidth: 1400, paddingLeft: 32, paddingRight: 32, gap: 24 }}
        >
          {/* LEFT: Brand logo — own container, no clipping */}
          <div className="flex items-center flex-shrink-0" style={{ minWidth: 140 }}>
            <img
              src="/logo_speedfox.png"
              alt="Speedfox"
              style={{ height: 36, display: 'block' }}
            />
          </div>

          {/* CENTER: Tab nav — segmented pill */}
          <nav
            className="flex items-center"
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
                    padding: '8px 18px',
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

          {/* SPACER */}
          <div className="flex-1" />

          {/* RIGHT: Connection badges */}
          <div className="flex items-center gap-8">
            {connectionType !== 'unknown' && connectionType !== 'Unknown' && (
              <div
                className="flex items-center gap-1.5"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-inset)',
                  padding: '6px 12px',
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

            {/* Install button — desktop */}
            {canInstall && (
              <button
                onClick={install}
                className="flex items-center gap-1.5 cursor-pointer"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'white',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 2px 8px rgba(6, 182, 212, 0.25)',
                }}
              >
                <Download size={12} />
                Install App
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ====== MOBILE BOTTOM NAV ====== */}
      <nav className="mobile-nav nav-surface"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom, 6px)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 24, padding: '6px 16px',
        }}>
          {tabs.map(({ id, icon: Icon, labelKey }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 2, padding: '6px 12px',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.15s ease',
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
