import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { resumeAutoTestIfNeeded } from './engine/autoTest';

function useThemeEffect() {
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark: boolean) => {
      root.classList.toggle('dark', isDark);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', isDark ? '#06090f' : '#f8fafc');
    };

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches);
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);
}

export default function App() {
  useThemeEffect();

  const activeTab = useStore((s) => s.activeTab);
  const loadHistory = useStore((s) => s.loadHistory);

  useEffect(() => { loadHistory(); resumeAutoTestIfNeeded(); }, [loadHistory]);

  return (
    <>
      <Navigation />
      {/* App content — offset for desktop nav (56px) */}
      <main className="flex-1 flex flex-col" style={{ paddingTop: 0 }}>
        <div className="hidden lg:block" style={{ height: 56 }} />
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col"
            >
              <Dashboard />
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col"
            >
              <History />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col"
            >
              <Settings />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
