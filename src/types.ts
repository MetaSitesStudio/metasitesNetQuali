export interface TestResult {
  id: string;
  timestamp: number;
  download: number;   // Mbps
  upload: number;     // Mbps
  ping: number;       // ms
  jitter: number;     // ms
  packetLoss: number; // percentage
  bufferbloat: number; // ms added latency
  connectionType: string;
  isp: string;
  grade: 'excellent' | 'good' | 'fair' | 'poor';
  qualityScore?: number; // 0–100 composite score
  dnsSpeed?: number;     // ms to resolve DNS
  serverLocation?: string; // test server location
}

export type TestPhase = 'idle' | 'ping' | 'dns' | 'download' | 'upload' | 'jitter' | 'packetLoss' | 'bufferbloat' | 'complete';
export type ThemeMode = 'system' | 'dark' | 'light';
export type TabId = 'dashboard' | 'history' | 'settings';
export type ScreenFlow = 'splash' | 'scan' | 'results';
