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
 * The API's `type` field gives the physical transport (wifi, ethernet, cellular),
 * while `effectiveType` is a throughput estimate (4g, 3g, etc.) that always says "4g" for fast WiFi.
 * We prioritize `type` over `effectiveType` for accurate reporting.
 */
export function getConnectionType(): string {
  const nav = navigator as any;
  if (nav.connection) {
    const c = nav.connection;
    // `type` gives the actual physical connection: wifi, ethernet, cellular, bluetooth, etc.
    if (c.type) {
      switch (c.type) {
        case 'wifi': return 'WiFi';
        case 'ethernet': return 'Ethernet';
        case 'cellular': return c.effectiveType ? c.effectiveType.toUpperCase() : 'Cellular';
        case 'bluetooth': return 'Bluetooth';
        case 'wimax': return 'WiMAX';
        default: return c.type;
      }
    }
    // Fallback: if `type` is unavailable (some Chrome versions), infer from context
    // Check if we're on a desktop browser — almost certainly WiFi or Ethernet
    if (!('ontouchstart' in window) && !navigator.maxTouchPoints) {
      return 'WiFi / Ethernet';
    }
    // Don't show effectiveType (4g/3g) as it confuses WiFi users
    return 'WiFi';
  }
  return 'Unknown';
}

/**
 * Detect ISP by calling a free IP information API.
 */
export async function detectISP(): Promise<{ isp: string; ip: string }> {
  try {
    const res = await fetch('https://ipinfo.io/json?token=', { cache: 'no-store' });
    if (!res.ok) throw new Error('IP info fetch failed');
    const data = await res.json();
    return {
      isp: data.org ? data.org.replace(/^AS\d+\s*/, '') : 'Unknown',
      ip: data.ip || '',
    };
  } catch {
    try {
      // Fallback API
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return { isp: 'Unknown', ip: data.ip || '' };
    } catch {
      return { isp: 'Unknown', ip: '' };
    }
  }
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
