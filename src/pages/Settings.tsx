import { useTranslation } from 'react-i18next';
import { Sun, Moon, Monitor, Globe, Gauge, Shield, Info, Smartphone } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { languages } from '../i18n';
import type { ThemeMode } from '../types';

export function Settings() {
  const { t, i18n } = useTranslation();
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const ispSpeed = useStore((s) => s.ispSpeed);
  const setIspSpeed = useStore((s) => s.setIspSpeed);
  const { canInstall, isInstalled, install } = useInstallPrompt();

  const themes: { id: ThemeMode; icon: typeof Sun; label: string }[] = [
    { id: 'system', icon: Monitor, label: t('settings.themeSystem') },
    { id: 'dark', icon: Moon, label: t('settings.themeDark') },
    { id: 'light', icon: Sun, label: t('settings.themeLight') },
  ];

  return (
    <div className="app-container page-body">
      {/* Page header */}
      <div className="mb-8">
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {t('settings.title')}
        </h1>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)', marginTop: 2 }}>
          Customize your experience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ maxWidth: 900 }}>

        {/* Theme */}
        <div className="panel" style={{ padding: '20px 22px' }}>
          <div className="section-label">
            <Moon size={13} />
            {t('settings.theme')}
          </div>
          <div className="segmented" style={{ width: '100%' }}>
            {themes.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`segmented-btn ${theme === id ? 'segmented-btn--active' : ''}`}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px' }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ISP Speed */}
        <div className="panel" style={{ padding: '20px 22px' }}>
          <div className="section-label">
            <Gauge size={13} />
            {t('settings.ispSpeed')}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10, marginTop: -4 }}>
            {t('settings.ispSpeedDesc')}
          </p>
          <div className="flex items-center gap-2.5">
            <input
              type="number"
              value={ispSpeed || ''}
              onChange={(e) => setIspSpeed(Number(e.target.value))}
              placeholder="100"
              className="input"
              style={{ maxWidth: 140 }}
              min={0}
              max={10000}
            />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>Mbps</span>
          </div>
        </div>

        {/* Install App — only show if installable */}
        {(canInstall || isInstalled) && (
          <div className="panel" style={{ padding: '20px 22px' }}>
            <div className="section-label">
              <Smartphone size={13} />
              Install App
            </div>
            {isInstalled ? (
              <div className="flex items-center gap-2">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-green)' }}>App installed</span>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10, marginTop: -4 }}>
                  Install NetQual as a native app for quick access and offline support.
                </p>
                <button
                  onClick={install}
                  className="flex items-center gap-2 cursor-pointer"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))',
                    border: 'none',
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    boxShadow: '0 2px 12px rgba(6, 182, 212, 0.25)',
                  }}
                >
                  <Smartphone size={15} />
                  Install NetQual
                </button>
              </>
            )}
          </div>
        )}

        {/* Language */}
        <div className="panel lg:col-span-2" style={{ padding: '20px 22px' }}>
          <div className="section-label">
            <Globe size={13} />
            {t('settings.language')}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {languages.map((lang) => {
              const isActive = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    localStorage.setItem('netqual-language', lang.code);
                  }}
                  className="flex items-center gap-2.5 cursor-pointer"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isActive ? 'var(--accent-soft)' : 'var(--bg-inset)',
                    border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 500,
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.12s ease',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{lang.flag}</span>
                  <span className="truncate">{lang.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* About */}
        <div className="panel lg:col-span-2" style={{ padding: '20px 22px' }}>
          <div className="section-label">
            <Info size={13} />
            {t('settings.about')}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {t('settings.version')}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-inset)',
                  color: 'var(--text-tertiary)',
                }}
              >
                2.0.0
              </span>
            </div>
            <div className="flex items-start gap-2 flex-1">
              <Shield size={15} style={{ color: 'var(--accent-green)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('settings.privacy')}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {t('settings.privacyDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
