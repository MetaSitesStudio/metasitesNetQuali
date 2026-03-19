import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { SpeedGauge } from '../components/SpeedGauge';
import { SpeedFoxMascot } from '../components/SpeedFoxMascot';
import { LiveMetricTicker } from '../components/LiveMetricTicker';
import { LiveSpeedGraph } from '../components/LiveSpeedGraph';
import { AdCarousel } from '../components/AdCarousel';
import { ParticleBackground } from '../components/ParticleBackground';
import { runSpeedTest, stopSpeedTest } from '../engine/speedTest';

export function ScanScreen() {
  const { t } = useTranslation();
  const phase = useStore((s) => s.phase);
  const progress = useStore((s) => s.progress);
  const download = useStore((s) => s.currentDownload);
  const upload = useStore((s) => s.currentUpload);
  const setScreenFlow = useStore((s) => s.setScreenFlow);

  const isRunning = phase !== 'idle' && phase !== 'complete';
  const isComplete = phase === 'complete';
  const hasTransitioned = useRef(false);

  // Derive mascot state
  const mascotState = isRunning ? 'scanning' as const : 'idle' as const;

  // Auto-transition to results when complete
  useEffect(() => {
    if (isComplete && !hasTransitioned.current) {
      hasTransitioned.current = true;
      const timer = setTimeout(() => setScreenFlow('results'), 800);
      return () => clearTimeout(timer);
    }
    if (!isComplete) {
      hasTransitioned.current = false;
    }
  }, [isComplete, setScreenFlow]);

  const handleStartTest = () => {
    useStore.getState().resetTest();
    runSpeedTest();
  };

  const handleStopTest = () => {
    stopSpeedTest();
  };

  // Phase label + context
  const phaseInfo = (() => {
    switch (phase) {
      case 'ping': return { label: 'Checking responsiveness...', context: 'How fast servers respond to you' };
      case 'dns': return { label: 'Measuring DNS resolution...', context: 'How quickly domains are resolved' };
      case 'download': return { label: 'Testing download throughput...', context: 'Your maximum receive speed' };
      case 'upload': return { label: 'Measuring upload capacity...', context: 'Your maximum send speed' };
      case 'jitter': return { label: 'Analyzing connection stability...', context: 'Consistency of your connection' };
      case 'packetLoss': return { label: 'Checking data integrity...', context: 'Whether data arrives intact' };
      case 'bufferbloat': return { label: 'Testing latency under load...', context: 'How your connection handles traffic spikes' };
      case 'complete': return { label: 'Analysis complete', context: '' };
      default: return { label: '', context: '' };
    }
  })();

  return (
    <div className="relative" style={{ minHeight: '100vh' }}>
      {/* Particle background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <ParticleBackground isActive={isRunning} />
      </div>

      <div
        className="relative flex flex-col items-center justify-center"
        style={{
          zIndex: 1,
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 24px',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {/* Mascot — absolutely positioned, decorative, doesn't affect centering */}
        <div
          className="hidden lg:flex mascot-container"
          style={{
            position: 'absolute',
            left: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
          }}
        >
          <SpeedFoxMascot state={mascotState} />
        </div>

        {/* Ad Carousel — desktop only, right side */}
        <div
          className="hidden lg:flex"
          style={{
            position: 'absolute',
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
          }}
        >
          <AdCarousel />
        </div>

        {/* Center column: gauge + controls — truly centered */}
        <div className="flex flex-col items-center" style={{ maxWidth: 480, width: '100%' }}>
            {/* Phase indicator — only during test */}
            <AnimatePresence mode="wait">
              {isRunning && (
                <motion.div
                  key={phaseInfo.label}
                  className="flex flex-col items-center"
                  style={{
                    padding: '8px 20px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border)',
                    backdropFilter: 'blur(8px)',
                    marginBottom: 16,
                    textAlign: 'center',
                  }}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--accent-orange)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-orange)' }}>
                      {phaseInfo.label}
                    </span>
                  </div>
                  {phaseInfo.context && (
                    <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-tertiary)', marginTop: 3 }}>
                      {phaseInfo.context}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress bar — during test */}
            <AnimatePresence>
              {isRunning && (
                <motion.div
                  style={{
                    width: '100%', maxWidth: 320, height: 3,
                    borderRadius: 2, background: 'var(--gauge-track)',
                    marginBottom: 16, overflow: 'hidden',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    style={{
                      height: '100%', borderRadius: 2,
                      background: 'linear-gradient(90deg, var(--accent), var(--accent-purple))',
                    }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.25 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Speed Gauge — always the star */}
            <motion.div
              className="panel"
              style={{ padding: 'clamp(24px, 3vw, 40px)', width: '100%' }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <SpeedGauge
                speed={phase === 'upload' ? upload : download}
                label={phase === 'upload' ? t('dashboard.upload') : t('dashboard.download')}
                isActive={isRunning}
              />
            </motion.div>

            {/* CTA / Stop button */}
            <div style={{ marginTop: 24 }}>
              {!isRunning && !isComplete ? (
                <motion.button
                  onClick={handleStartTest}
                  style={{
                    padding: '14px 32px',
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    fontSize: 15,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    boxShadow: '0 10px 30px rgba(59,130,246,0.35)',
                    letterSpacing: '0.01em',
                  }}
                  whileHover={{ scale: 1.03, boxShadow: '0 12px 36px rgba(59,130,246,0.45)' }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Start Analysis
                </motion.button>
              ) : isRunning ? (
                <motion.button
                  onClick={handleStopTest}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 999,
                    background: 'var(--bg-inset)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                  whileHover={{ background: 'var(--bg-panel)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
              ) : null}
            </div>

            {/* Compact live metrics — during test only */}
            <AnimatePresence>
              {isRunning && (
                <motion.div
                  style={{ marginTop: 24, width: '100%' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LiveMetricTicker />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Live speed graph — during test */}
            <AnimatePresence>
              {isRunning && (
                <motion.div
                  style={{ marginTop: 16, width: '100%' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LiveSpeedGraph />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
  );
}
