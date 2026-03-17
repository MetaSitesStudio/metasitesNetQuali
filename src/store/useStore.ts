import { create } from 'zustand';
import type { TestResult, TestPhase, ThemeMode, TabId } from '../types';
import { getAllResults, saveResult, clearAllResults } from './db';

interface AppState {
  // Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Test state
  phase: TestPhase;
  progress: number; // 0-100
  currentDownload: number;
  currentUpload: number;
  currentPing: number;
  currentJitter: number;
  currentPacketLoss: number;
  currentBufferbloat: number;
  currentDns: number;
  speedGraphData: { time: number; speed: number; type: 'download' | 'upload' }[];
  connectionType: string;
  ispName: string;
  latestResult: TestResult | null;

  setPhase: (phase: TestPhase) => void;
  setProgress: (p: number) => void;
  setCurrentDownload: (v: number) => void;
  setCurrentUpload: (v: number) => void;
  setCurrentPing: (v: number) => void;
  setCurrentJitter: (v: number) => void;
  setCurrentPacketLoss: (v: number) => void;
  setCurrentBufferbloat: (v: number) => void;
  setCurrentDns: (v: number) => void;
  setConnectionType: (t: string) => void;
  setIspName: (n: string) => void;
  setLatestResult: (r: TestResult) => void;
  resetTest: () => void;
  addSpeedGraphPoint: (speed: number, type: 'download' | 'upload') => void;
  clearSpeedGraph: () => void;

  // History
  history: TestResult[];
  loadHistory: () => Promise<void>;
  addToHistory: (result: TestResult) => Promise<void>;
  clearHistory: () => Promise<void>;

  // Settings
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  ispSpeed: number;
  setIspSpeed: (s: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Navigation
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Test state
  phase: 'idle',
  progress: 0,
  currentDownload: 0,
  currentUpload: 0,
  currentPing: 0,
  currentJitter: 0,
  currentPacketLoss: 0,
  currentBufferbloat: 0,
  currentDns: 0,
  speedGraphData: [],
  connectionType: 'unknown',
  ispName: '',
  latestResult: null,

  setPhase: (phase) => set({ phase }),
  setProgress: (progress) => set({ progress }),
  setCurrentDownload: (currentDownload) => set({ currentDownload }),
  setCurrentUpload: (currentUpload) => set({ currentUpload }),
  setCurrentPing: (currentPing) => set({ currentPing }),
  setCurrentJitter: (currentJitter) => set({ currentJitter }),
  setCurrentPacketLoss: (currentPacketLoss) => set({ currentPacketLoss }),
  setCurrentBufferbloat: (currentBufferbloat) => set({ currentBufferbloat }),
  setCurrentDns: (currentDns) => set({ currentDns }),
  setConnectionType: (connectionType) => set({ connectionType }),
  setIspName: (ispName) => set({ ispName }),
  setLatestResult: (latestResult) => set({ latestResult }),

  resetTest: () =>
    set({
      phase: 'idle',
      progress: 0,
      currentDownload: 0,
      currentUpload: 0,
      currentPing: 0,
      currentJitter: 0,
      currentPacketLoss: 0,
      currentBufferbloat: 0,
      currentDns: 0,
      speedGraphData: [],
      latestResult: null,
    }),

  addSpeedGraphPoint: (speed, type) => {
    const data = get().speedGraphData;
    const time = data.length > 0 ? data[data.length - 1].time + 0.25 : 0;
    set({ speedGraphData: [...data, { time: Math.round(time * 100) / 100, speed: Math.round(speed * 100) / 100, type }] });
  },
  clearSpeedGraph: () => set({ speedGraphData: [] }),

  // History
  history: [],
  loadHistory: async () => {
    const results = await getAllResults();
    set({ history: results });
  },
  addToHistory: async (result) => {
    await saveResult(result);
    const history = get().history;
    set({ history: [result, ...history] });
  },
  clearHistory: async () => {
    await clearAllResults();
    set({ history: [] });
  },

  // Settings
  theme: (localStorage.getItem('netqual-theme') as ThemeMode) || 'system',
  setTheme: (theme) => {
    localStorage.setItem('netqual-theme', theme);
    set({ theme });
  },
  ispSpeed: Number(localStorage.getItem('netqual-isp-speed')) || 0,
  setIspSpeed: (ispSpeed) => {
    localStorage.setItem('netqual-isp-speed', String(ispSpeed));
    set({ ispSpeed });
  },
}));
