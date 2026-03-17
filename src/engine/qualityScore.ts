import type { TestResult } from '../types';

/**
 * Compute a composite connection quality score (0–100).
 * Weighted formula matching industry priorities.
 */
export function computeQualityScore(result: Pick<TestResult, 'download' | 'upload' | 'ping' | 'jitter' | 'packetLoss' | 'bufferbloat'>): number {
  // Download: 0–100 → scaled from 0–500 Mbps
  const dlScore = Math.min(result.download / 500, 1) * 100;

  // Upload: 0–100 → scaled from 0–200 Mbps
  const ulScore = Math.min(result.upload / 200, 1) * 100;

  // Ping: 100 = <5ms, 0 = >200ms (inverse)
  const pingScore = Math.max(0, Math.min(100, 100 - (result.ping / 200) * 100));

  // Jitter: 100 = 0ms, 0 = >50ms (inverse)
  const jitterScore = Math.max(0, Math.min(100, 100 - (result.jitter / 50) * 100));

  // Packet loss: 100 = 0%, 0 = >5% (inverse)
  const plScore = Math.max(0, Math.min(100, 100 - (result.packetLoss / 5) * 100));

  // Bufferbloat: 100 = <5ms, 0 = >200ms (inverse)
  const bbScore = Math.max(0, Math.min(100, 100 - (result.bufferbloat / 200) * 100));

  // Weighted average
  const score = (
    dlScore * 0.30 +
    ulScore * 0.15 +
    pingScore * 0.25 +
    jitterScore * 0.10 +
    plScore * 0.10 +
    bbScore * 0.10
  );

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Get the score tier label and color.
 */
export function getScoreTier(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Excellent', color: 'var(--accent-green)' };
  if (score >= 70) return { label: 'Good', color: 'var(--accent)' };
  if (score >= 50) return { label: 'Fair', color: 'var(--accent-orange)' };
  if (score >= 30) return { label: 'Poor', color: 'var(--accent-red)' };
  return { label: 'Critical', color: 'var(--accent-red)' };
}

/**
 * Get ISP plan utilization percentage.
 */
export function getPlanUtilization(measuredMbps: number, planMbps: number): number {
  if (planMbps <= 0) return 0;
  return Math.round((measuredMbps / planMbps) * 100);
}

/**
 * Generate actionable recommendations based on test results.
 */
export function getRecommendations(result: Pick<TestResult, 'download' | 'upload' | 'ping' | 'jitter' | 'packetLoss' | 'bufferbloat'>, planMbps: number): string[] {
  const tips: string[] = [];

  // ISP plan comparison
  if (planMbps > 0) {
    const util = getPlanUtilization(result.download, planMbps);
    if (util < 50) {
      tips.push(`You're only getting ${util}% of your ${planMbps} Mbps plan. Contact your ISP or check your router.`);
    } else if (util < 80) {
      tips.push(`Getting ${util}% of your plan speed. Try connecting via Ethernet for better throughput.`);
    }
  }

  // High ping
  if (result.ping > 100) {
    tips.push('Very high ping. Check for VPN overhead, or switch to a closer DNS server.');
  } else if (result.ping > 50) {
    tips.push('Elevated ping. Try switching to 5GHz WiFi or connecting via Ethernet.');
  }

  // Jitter
  if (result.jitter > 15) {
    tips.push('High jitter detected. This affects video calls and gaming. Check for network congestion.');
  }

  // Packet loss
  if (result.packetLoss > 2) {
    tips.push('Significant packet loss. Check for WiFi interference, cable quality, or ISP issues.');
  } else if (result.packetLoss > 0) {
    tips.push('Minor packet loss detected. Monitor over time — this can affect streaming quality.');
  }

  // Bufferbloat
  if (result.bufferbloat > 100) {
    tips.push('Severe bufferbloat. Consider enabling SQM/QoS on your router for better latency under load.');
  } else if (result.bufferbloat > 30) {
    tips.push('Noticeable bufferbloat. Your router may need QoS settings to manage traffic better.');
  }

  // Low download
  if (result.download < 10) {
    tips.push('Very slow download speed. Restart your router or check if other devices are consuming bandwidth.');
  }

  // Low upload
  if (result.upload < 5) {
    tips.push('Low upload speed may affect video conferencing and cloud backups.');
  }

  // Cap at 4 most relevant
  return tips.slice(0, 4);
}
