import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sun, Moon, Monitor, Globe, Gauge, Shield, Info, Smartphone,
  Server, Clock, Bell, WifiOff, Wifi, ArrowRightLeft, AlertCircle,
  Trash2, Play, Square,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useNetworkMonitor, type NetworkAlert } from '../hooks/useNetworkMonitor';
import { languages } from '../i18n';
import { SERVER_LOCATIONS, getDefaultServerId, setDefaultServerId } from '../engine/serverLocations';
import {
  getAutoTestConfig, startAutoTest, stopAutoTest, formatNextRun,
} from '../engine/autoTest';
import type { ThemeMode } from '../types';

const INTERVAL_OPTIONS = [
  { value: 1, label: '1h' },
  { value: 2, label: '2h' },
  { value: 4, label: '4h' },
  { value: 6, label: '6h' },
  { value: 12, label: '12h' },
  { value: 24, label: '24h' },
];

export function Settings() {
  const { t, i18n } = useTranslation();
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const ispSpeed = useStore((s) => s.ispSpeed);
  const setIspSpeed = useStore((s) => s.setIspSpeed);
  const { canInstall, isInstalled, install } = useInstallPrompt();
  const { getAlerts, clearAlerts, getNetworkStatus } = useNetworkMonitor();

  // Server selector
  const [selectedServer, setSelectedServer] = useState(getDefaultServerId());

  // Auto-test
  const [autoConfig, setAutoConfig] = useState(getAutoTestConfig());
  const [selectedInterval, setSelectedInterval] = useState(autoConfig.intervalHours);

  // Network alerts
  const [alerts, setAlerts] = useState<NetworkAlert[]>([]);
  const networkStatus = getNetworkStatus();

  useEffect(() => {
    setAlerts(getAlerts());
    const id = setInterval(() => {
      setAlerts(getAlerts());
      setAutoConfig(getAutoTestConfig());
    }, 5000);
    return () => clearInterval(id);
  }, [getAlerts]);

  const handleServerChange = (serverId: string) => {
    setSelectedServer(serverId);
    setDefaultServerId(serverId);
  };

  const handleAutoTestToggle = () => {
    if (autoConfig.enabled) {
      stopAutoTest();
      setAutoConfig(getAutoTestConfig());
    } else {
      startAutoTest(selectedInterval);
      setAutoConfig(getAutoTestConfig());
    }
  };

  const themes: { id: ThemeMode; icon: typeof Sun; label: string }[] = [
    { id: 'system', icon: Monitor, label: t('settings.themeSystem') },
    { id: 'dark', icon: Moon, label: t('settings.themeDark') },
    { id: 'light', icon: Sun, label: t('settings.themeLight') },
  ];

  const alertIcon = (type: NetworkAlert['type']) => {
    switch (type) {
      case 'connection_change': return <ArrowRightLeft size={13} style={{ color: 'var(--accent-orange)' }} />;
      case 'quality_drop': return <AlertCircle size={13} style={{ color: 'var(--accent-red)' }} />;
      case 'offline': return <WifiOff size={13} style={{ color: 'var(--accent-red)' }} />;
      case 'online': return <Wifi size={13} style={{ color: 'var(--accent-green)' }} />;
    }
  };

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

        {/* Server Selector */}
        <div className="panel lg:col-span-2" style={{ padding: '20px 22px' }}>
          <div className="section-label">
            <Server size={13} />
            Server Location
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12, marginTop: -4 }}>
            Choose a test server to measure speed against different regions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
            {SERVER_LOCATIONS.map((server) => {
              const isActive = selectedServer === server.id;
              return (
                <button
                  key={server.id}
                  onClick={() => handleServerChange(server.id)}
                  className="flex items-center gap-2.5 cursor-pointer"
                  style={{
                    padding: '10px 14px',
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
                  <span style={{ fontSize: 18 }}>{server.flag}</span>
                  <div>
                    <p style={{ fontWeight: isActive ? 700 : 600 }}>{server.name}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>{server.region}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto-Test */}
        <div className="panel" style={{ padding: '20px 22px' }}>
          <div className="section-label">
            <Clock size={13} />
            Scheduled Tests
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12, marginTop: -4 }}>
            Automatically run speed tests at regular intervals
          </p>

          {/* Interval selector */}
          <div className="segmented mb-3" style={{ width: '100%' }}>
            {INTERVAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setSelectedInterval(opt.value);
                  if (autoConfig.enabled) {
                    startAutoTest(opt.value);
                    setAutoConfig(getAutoTestConfig());
                  }
                }}
                className={`segmented-btn ${selectedInterval === opt.value ? 'segmented-btn--active' : ''}`}
                style={{ flex: 1, padding: '6px 8px' }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Toggle + status */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleAutoTestToggle}
              className="flex items-center gap-2 cursor-pointer"
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                background: autoConfig.enabled
                  ? 'color-mix(in srgb, var(--accent-red) 15%, transparent)'
                  : 'linear-gradient(135deg, var(--accent), var(--accent-purple))',
                border: autoConfig.enabled
                  ? '1px solid color-mix(in srgb, var(--accent-red) 30%, transparent)'
                  : 'none',
                color: autoConfig.enabled ? 'var(--accent-red)' : 'white',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
              }}
            >
              {autoConfig.enabled ? <Square size={13} /> : <Play size={13} />}
              {autoConfig.enabled ? 'Stop' : 'Start'}
            </button>
            {autoConfig.enabled && (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)' }}>
                Next: {formatNextRun(autoConfig.nextRun)}
              </span>
            )}
          </div>
        </div>

        {/* Install App */}
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

        {/* Network Alerts */}
        <div className="panel lg:col-span-2" style={{ padding: '20px 22px' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="section-label" style={{ marginBottom: 0 }}>
              <Bell size={13} />
              Network Alerts
            </div>
            <div className="flex items-center gap-3">
              {networkStatus && (
                <div className="flex items-center gap-2">
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: navigator.onLine ? 'var(--accent-green)' : 'var(--accent-red)',
                  }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)' }}>
                    {networkStatus.type !== 'unknown' && networkStatus.type}
                    {networkStatus.downlink > 0 && ` · ${networkStatus.downlink} Mbps`}
                    {networkStatus.rtt > 0 && ` · ${networkStatus.rtt}ms`}
                  </span>
                </div>
              )}
              {alerts.length > 0 && (
                <button
                  onClick={() => { clearAlerts(); setAlerts([]); }}
                  className="flex items-center gap-1 cursor-pointer"
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-inset)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-tertiary)',
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <Trash2 size={10} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {alerts.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', opacity: 0.6 }}>
              No network changes detected yet. Alerts will appear when your connection type changes or goes offline.
            </p>
          ) : (
            <div className="flex flex-col gap-1" style={{ maxHeight: 200, overflowY: 'auto' }}>
              {alerts.slice(0, 20).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-2.5"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-inset)',
                  }}
                >
                  {alertIcon(alert.type)}
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', flex: 1 }}>
                    {alert.message}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-tertiary)', flexShrink: 0 }}>
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

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
                2.1.0
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
