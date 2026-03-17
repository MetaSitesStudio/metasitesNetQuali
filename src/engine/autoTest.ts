import { runSpeedTest } from './speedTest';

export interface AutoTestConfig {
  enabled: boolean;
  intervalHours: number; // 1, 2, 4, 6, 12, 24
  lastRun: number;       // timestamp
  nextRun: number;       // timestamp
}

const STORAGE_KEY = 'netqual-autotest';
let intervalId: ReturnType<typeof setInterval> | null = null;

export function getAutoTestConfig(): AutoTestConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return {
    enabled: false,
    intervalHours: 4,
    lastRun: 0,
    nextRun: 0,
  };
}

export function saveAutoTestConfig(config: AutoTestConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function startAutoTest(intervalHours: number): void {
  stopAutoTest();

  const config: AutoTestConfig = {
    enabled: true,
    intervalHours,
    lastRun: Date.now(),
    nextRun: Date.now() + intervalHours * 3600 * 1000,
  };
  saveAutoTestConfig(config);

  // Run immediately
  runSpeedTest();

  // Schedule repeating
  const ms = intervalHours * 3600 * 1000;
  intervalId = setInterval(() => {
    const cfg = getAutoTestConfig();
    if (!cfg.enabled) {
      stopAutoTest();
      return;
    }
    cfg.lastRun = Date.now();
    cfg.nextRun = Date.now() + ms;
    saveAutoTestConfig(cfg);
    runSpeedTest();
  }, ms);

  // Also show notification if available
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function stopAutoTest(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  const config = getAutoTestConfig();
  config.enabled = false;
  config.nextRun = 0;
  saveAutoTestConfig(config);
}

/**
 * Resume auto-test on page load if it was enabled.
 */
export function resumeAutoTestIfNeeded(): void {
  const config = getAutoTestConfig();
  if (!config.enabled) return;

  // Check if a test is overdue
  const now = Date.now();
  if (config.nextRun > 0 && now >= config.nextRun) {
    // Overdue — run now and reschedule
    startAutoTest(config.intervalHours);
  } else if (config.nextRun > now) {
    // Schedule remaining time
    const remaining = config.nextRun - now;
    setTimeout(() => {
      startAutoTest(config.intervalHours);
    }, remaining);
  }
}

export function formatNextRun(timestamp: number): string {
  if (timestamp <= 0) return 'Not scheduled';
  const diff = timestamp - Date.now();
  if (diff <= 0) return 'Running now...';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  return `in ${hours}h ${mins % 60}m`;
}
