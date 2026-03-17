import { useEffect, useRef, useCallback } from 'react';

interface NetworkInfo {
  type: string;        // wifi, ethernet, cellular, etc.
  effectiveType: string; // 4g, 3g, 2g, slow-2g
  downlink: number;    // Mbps estimate
  rtt: number;         // ms round-trip estimate
  saveData: boolean;
}

export interface NetworkAlert {
  id: string;
  timestamp: number;
  type: 'connection_change' | 'quality_drop' | 'offline' | 'online';
  message: string;
  from?: string;
  to?: string;
}

const MAX_ALERTS = 50;

function getNetworkInfo(): NetworkInfo | null {
  const nav = navigator as any;
  if (!nav.connection) return null;
  const c = nav.connection;
  return {
    type: c.type || 'unknown',
    effectiveType: c.effectiveType || 'unknown',
    downlink: c.downlink || 0,
    rtt: c.rtt || 0,
    saveData: c.saveData || false,
  };
}

export function useNetworkMonitor() {
  const alerts = useRef<NetworkAlert[]>([]);
  const lastType = useRef<string>('');
  const lastEffective = useRef<string>('');

  const addAlert = useCallback((alert: Omit<NetworkAlert, 'id' | 'timestamp'>) => {
    const newAlert: NetworkAlert = {
      ...alert,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: Date.now(),
    };
    alerts.current = [newAlert, ...alerts.current].slice(0, MAX_ALERTS);

    // Save to localStorage
    try {
      localStorage.setItem('netqual-alerts', JSON.stringify(alerts.current));
    } catch { /* storage full */ }

    return newAlert;
  }, []);

  useEffect(() => {
    // Load saved alerts
    try {
      const saved = localStorage.getItem('netqual-alerts');
      if (saved) alerts.current = JSON.parse(saved);
    } catch { /* ignore */ }

    const nav = navigator as any;

    // Initial state
    const info = getNetworkInfo();
    if (info) {
      lastType.current = info.type;
      lastEffective.current = info.effectiveType;
    }

    // Connection change listener
    const handleChange = () => {
      const info = getNetworkInfo();
      if (!info) return;

      // Connection type changed (e.g., WiFi → 4G)
      if (lastType.current && info.type !== lastType.current) {
        addAlert({
          type: 'connection_change',
          message: `Connection changed: ${lastType.current} → ${info.type}`,
          from: lastType.current,
          to: info.type,
        });
      }

      // Effective type degraded (e.g., 4g → 3g)
      const typeRank: Record<string, number> = { '4g': 4, '3g': 3, '2g': 2, 'slow-2g': 1 };
      const oldRank = typeRank[lastEffective.current] || 0;
      const newRank = typeRank[info.effectiveType] || 0;
      if (oldRank > 0 && newRank > 0 && newRank < oldRank) {
        addAlert({
          type: 'quality_drop',
          message: `Network quality dropped: ${lastEffective.current} → ${info.effectiveType}`,
          from: lastEffective.current,
          to: info.effectiveType,
        });
      }

      lastType.current = info.type;
      lastEffective.current = info.effectiveType;
    };

    if (nav.connection) {
      nav.connection.addEventListener('change', handleChange);
    }

    // Online/offline listeners
    const handleOffline = () => {
      addAlert({
        type: 'offline',
        message: 'Connection lost — you are offline',
      });
    };
    const handleOnline = () => {
      addAlert({
        type: 'online',
        message: 'Connection restored — you are back online',
      });
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      if (nav.connection) {
        nav.connection.removeEventListener('change', handleChange);
      }
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [addAlert]);

  const getAlerts = useCallback((): NetworkAlert[] => {
    return alerts.current;
  }, []);

  const clearAlerts = useCallback(() => {
    alerts.current = [];
    localStorage.removeItem('netqual-alerts');
  }, []);

  const getNetworkStatus = useCallback((): NetworkInfo | null => {
    return getNetworkInfo();
  }, []);

  return { getAlerts, clearAlerts, getNetworkStatus, addAlert };
}
