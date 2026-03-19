import type { TestResult } from '../types';

export function getGrade(result: Omit<TestResult, 'id' | 'timestamp' | 'grade' | 'connectionType' | 'isp'>): TestResult['grade'] {
  let score = 0;
  if (result.download >= 100) score += 3;
  else if (result.download >= 50) score += 2;
  else if (result.download >= 10) score += 1;

  if (result.upload >= 50) score += 3;
  else if (result.upload >= 20) score += 2;
  else if (result.upload >= 5) score += 1;

  if (result.ping < 10) score += 3;
  else if (result.ping < 30) score += 2;
  else if (result.ping < 60) score += 1;

  if (result.jitter < 2) score += 3;
  else if (result.jitter < 5) score += 2;
  else if (result.jitter < 15) score += 1;

  if (result.packetLoss === 0) score += 3;
  else if (result.packetLoss < 1) score += 2;
  else if (result.packetLoss < 3) score += 1;

  if (result.bufferbloat < 5) score += 3;
  else if (result.bufferbloat < 30) score += 2;
  else if (result.bufferbloat < 100) score += 1;

  if (score >= 15) return 'excellent';
  if (score >= 10) return 'good';
  if (score >= 5) return 'fair';
  return 'poor';
}

export function gradeColor(grade: TestResult['grade']): string {
  switch (grade) {
    case 'excellent': return 'var(--accent-green)';
    case 'good': return 'var(--accent-cyan)';
    case 'fair': return 'var(--accent-orange)';
    case 'poor': return 'var(--accent-red)';
  }
}

export function speedColor(mbps: number): string {
  if (mbps >= 100) return 'var(--accent-green)';
  if (mbps >= 50) return 'var(--accent-cyan)';
  if (mbps >= 20) return 'var(--accent-teal)';
  if (mbps >= 5) return 'var(--accent-orange)';
  return 'var(--accent-red)';
}

export function pingColor(ms: number): string {
  if (ms < 15) return 'var(--accent-green)';
  if (ms < 30) return 'var(--accent-cyan)';
  if (ms < 60) return 'var(--accent-orange)';
  return 'var(--accent-red)';
}

export function formatSpeed(mbps: number): string {
  if (mbps >= 1000) return (mbps / 1000).toFixed(1);
  if (mbps >= 100) return mbps.toFixed(0);
  if (mbps >= 10) return mbps.toFixed(1);
  return mbps.toFixed(2);
}

export function formatSpeedUnit(mbps: number): string {
  return mbps >= 1000 ? 'Gbps' : 'Mbps';
}

export function formatPing(ms: number): string {
  if (ms < 1) return ms.toFixed(2);
  if (ms < 10) return ms.toFixed(1);
  return ms.toFixed(0);
}

/**
 * Detect connection type using the Network Information API.
 * On mobile: shows 4G/3G/2G (what users expect to see).
 * On desktop: shows WiFi/Ethernet.
 */
export function getConnectionType(): string {
  const nav = navigator as any;
  if (nav.connection) {
    const c = nav.connection;
    // `type` gives the physical connection: wifi, ethernet, cellular, etc.
    if (c.type) {
      switch (c.type) {
        case 'wifi': return 'WiFi';
        case 'ethernet': return 'Ethernet';
        case 'cellular': return c.effectiveType ? c.effectiveType.toUpperCase() : 'Cellular';
        case 'bluetooth': return 'Bluetooth';
        case 'wimax': return 'WiMAX';
        case 'none': return 'Offline';
        default: return c.type;
      }
    }
    // If `type` is unavailable, use effectiveType (4g/3g/2g)
    // This is common on Android Chrome where type isn't exposed
    if (c.effectiveType) {
      // On a touch device, effectiveType is meaningful (shows 4G/3G)
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        return c.effectiveType.toUpperCase();
      }
      // On desktop, effectiveType always says 4g for fast connections — not useful
      return 'WiFi / Ethernet';
    }
  }
  return 'Unknown';
}

/**
 * Detect ISP via Netlify Function proxy (HTTPS-safe, no Mixed Content).
 * Falls back to direct HTTPS APIs if the function is unavailable (local dev).
 */
export async function detectISP(): Promise<{ isp: string; ip: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  // Primary: Netlify Function proxy (production)
  try {
    const res = await fetch('/.netlify/functions/ipLookup', {
      signal: controller.signal,
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      clearTimeout(timer);
      if (data.isp && data.isp !== 'Unknown') {
        return { isp: data.isp, ip: data.ip || '' };
      }
    }
  } catch { /* continue to fallback */ }

  clearTimeout(timer);

  // Fallback: direct HTTPS call (local dev without Netlify CLI)
  try {
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        isp: data.org || data.asn || 'Unknown',
        ip: data.ip || '',
      };
    }
  } catch { /* all failed */ }

  return { isp: 'Unknown', ip: '' };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
