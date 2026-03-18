import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowDown,
  ArrowUp,
  Zap,
  Activity,
  AlertTriangle,
  Waves,
  Wifi,
  Award,
  RotateCcw,
  Globe,
  Gauge,
  Share2,
  Lightbulb,
  Signal,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { SpeedGauge } from '../components/SpeedGauge';
import { MetricCard } from '../components/MetricCard';
import { TestButton } from '../components/TestButton';
import { ParticleBackground } from '../components/ParticleBackground';
import { runSpeedTest, stopSpeedTest } from '../engine/speedTest';
import { formatSpeed, formatPing, gradeColor, pingColor } from '../engine/utils';
import { getScoreTier, getPlanUtilization, getRecommendations } from '../engine/qualityScore';
import { shareResult } from '../engine/exportShare';
import { LiveSpeedGraph } from '../components/LiveSpeedGraph';
import { getMaxVideoQuality, getEstimatedLoadTime, getBufferingEstimate } from '../engine/videoQuality';
import { Tv } from 'lucide-react';

export function Dashboard() {
  const { t } = useTranslation();
  const phase = useStore((s) => s.phase);
  const progress = useStore((s) => s.progress);
  const download = useStore((s) => s.currentDownload);
  const upload = useStore((s) => s.currentUpload);
  const ping = useStore((s) => s.currentPing);
  const jitter = useStore((s) => s.currentJitter);
  const packetLoss = useStore((s) => s.currentPacketLoss);
  const bufferbloat = useStore((s) => s.currentBufferbloat);
  const dns = useStore((s) => s.currentDns);
  const connectionType = useStore((s) => s.connectionType);
  const ispName = useStore((s) => s.ispName);
  const latestResult = useStore((s) => s.latestResult);
  const ispSpeed = useStore((s) => s.ispSpeed);

  const isRunning = phase !== 'idle' && phase !== 'complete';
  const isComplete = phase === 'complete';

  const handleToggleTest = () => {
    if (isRunning) {
      stopSpeedTest();
    } else {
      useStore.getState().resetTest();
      runSpeedTest();
    }
  };

  const phaseLabel = (() => {
    switch (phase) {
      case 'ping': return t('dashboard.pingPhase');
      case 'dns': return 'Measuring DNS...';
      case 'download': return t('dashboard.downloadPhase');
      case 'upload': return t('dashboard.uploadPhase');
      case 'jitter': return t('dashboard.jitterPhase');
      case 'packetLoss': return t('dashboard.packetLossPhase');
      case 'bufferbloat': return t('dashboard.bufferbloatPhase');
      case 'complete': return t('dashboard.testComplete');
      default: return t('dashboard.idle');
    }
  })();

  // Quality score & recommendations
  const qualityScore = latestResult?.qualityScore ?? 0;
  const scoreTier = getScoreTier(qualityScore);
  const planUtil = ispSpeed > 0 && latestResult ? getPlanUtilization(latestResult.download, ispSpeed) : 0;
  const recommendations = latestResult
    ? getRecommendations(latestResult, ispSpeed)
    : [];

  return (
    <div className="relative">
      <div className="ambient-orb ambient-orb--cyan" />
      <div className="ambient-orb ambient-orb--purple" />

      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <ParticleBackground isActive={isRunning} />
      </div>

      <div className="app-container dashboard-body relative" style={{ zIndex: 1 }}>
        {/* MOBILE HEADER */}
        <div className="text-center mb-6 lg:hidden">
          <div className="flex items-center justify-center gap-2 mb-1">
            <img src="/logo_speedfox.png" alt="Speedfox" style={{ height: 28 }} />
          </div>
          {(connectionType !== 'unknown' || (ispName && ispName !== 'Unknown')) && (
            <div className="flex items-center justify-center gap-3 mt-1">
              {connectionType !== 'unknown' && (
                <span className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <Wifi size={11} style={{ color: 'var(--accent)' }} /> {connectionType}
                </span>
              )}
              {ispName && ispName !== 'Unknown' && (
                <span className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)' }}>
                  <Globe size={11} style={{ color: 'var(--accent-purple)' }} /> {ispName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* MAIN LAYOUT */}
        <div className="flex flex-col items-center lg:flex-row lg:items-start lg:justify-center lg:gap-8 xl:gap-12">

          {/* FAR LEFT: Hero mascot (desktop only) */}
          <div className="hidden lg:flex items-center justify-center flex-shrink-0" style={{ alignSelf: 'center' }}>
            <motion.img
              src="/SpeedFox_hero.png"
              alt="Speedfox Mascot"
              style={{ height: 'clamp(300px, 55vh, 600px)', objectFit: 'contain', filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.5))' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          {/* CENTER: Gauge + CTA */}
          <div className="flex flex-col items-center flex-shrink-0 mb-6 lg:mb-0">
            {/* Status pill */}
            <AnimatePresence mode="wait">
              <motion.div
                key={phaseLabel}
                className="flex items-center gap-2 mb-4"
                style={{
                  padding: '5px 14px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                  backdropFilter: 'blur(8px)',
                }}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
              >
                <div
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: isRunning ? 'var(--accent-orange)' : isComplete ? 'var(--accent-green)' : 'var(--text-tertiary)',
                  }}
                />
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: isRunning ? 'var(--accent-orange)' : isComplete ? 'var(--accent-green)' : 'var(--text-secondary)',
                }}>
                  {phaseLabel}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Progress bar */}
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

            {/* Gauge */}
            <motion.div
              className="panel"
              style={{ padding: 'clamp(20px, 3vw, 40px)' }}
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

            {/* CTA */}
            <div style={{ marginTop: 32, marginBottom: 32, position: 'relative', zIndex: 20 }}>
              <AnimatePresence mode="wait">
                {isComplete ? (
                  <motion.div
                    key="done"
                    className="flex items-center gap-2.5"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div
                      className="flex items-center gap-1.5"
                      style={{
                        padding: '7px 16px',
                        borderRadius: 'var(--radius-sm)',
                        background: `color-mix(in srgb, ${gradeColor(latestResult?.grade || 'fair')} 12%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${gradeColor(latestResult?.grade || 'fair')} 30%, transparent)`,
                      }}
                    >
                      <Award size={16} style={{ color: gradeColor(latestResult?.grade || 'fair') }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: gradeColor(latestResult?.grade || 'fair') }}>
                        {t(`dashboard.${latestResult?.grade || 'fair'}`)}
                      </span>
                    </div>

                    <motion.button
                      onClick={handleToggleTest}
                      className="flex items-center gap-1.5 cursor-pointer"
                      style={{
                        padding: '7px 16px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))',
                        border: 'none',
                        color: 'white',
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: 'var(--font-sans)',
                        boxShadow: '0 2px 12px rgba(6, 182, 212, 0.25)',
                      }}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <RotateCcw size={14} />
                      {t('dashboard.runAgain')}
                    </motion.button>

                    {/* Share button */}
                    {latestResult && (
                      <motion.button
                        onClick={() => shareResult(latestResult)}
                        className="flex items-center gap-1.5 cursor-pointer"
                        style={{
                          padding: '7px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-inset)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-secondary)',
                          fontSize: 13,
                          fontWeight: 500,
                          fontFamily: 'var(--font-sans)',
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Share2 size={14} />
                      </motion.button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <TestButton isRunning={isRunning} onClick={handleToggleTest} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quality Score + ISP Comparison — shows after test */}
            <AnimatePresence>
              {isComplete && latestResult && (
                <motion.div
                  className="w-full"
                  style={{ maxWidth: 380 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Score + Plan row */}
                  <div className="panel flex items-center gap-4" style={{ padding: '14px 18px' }}>
                    {/* Quality Score */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: 44, height: 44,
                          borderRadius: 'var(--radius-md)',
                          background: `color-mix(in srgb, ${scoreTier.color} 12%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${scoreTier.color} 25%, transparent)`,
                        }}
                      >
                        <span style={{ fontSize: 18, fontWeight: 800, color: scoreTier.color }}>
                          {qualityScore}
                        </span>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: scoreTier.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {scoreTier.label}
                        </p>
                        <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-tertiary)' }}>Quality Score</p>
                      </div>
                    </div>

                    {/* ISP Plan Comparison */}
                    {ispSpeed > 0 && (
                      <>
                        <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)' }}>Plan usage</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: planUtil >= 80 ? 'var(--accent-green)' : planUtil >= 50 ? 'var(--accent-orange)' : 'var(--accent-red)' }}>
                              {planUtil}%
                            </span>
                          </div>
                          <div style={{ height: 4, borderRadius: 2, background: 'var(--gauge-track)', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%', borderRadius: 2,
                                width: `${Math.min(planUtil, 100)}%`,
                                background: planUtil >= 80 ? 'var(--accent-green)' : planUtil >= 50 ? 'var(--accent-orange)' : 'var(--accent-red)',
                                transition: 'width 0.5s ease',
                              }}
                            />
                          </div>
                          <p style={{ fontSize: 9, fontWeight: 500, color: 'var(--text-tertiary)', marginTop: 2 }}>
                            {formatSpeed(latestResult.download)} / {ispSpeed} Mbps
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Metrics + Recommendations */}
          <div className="w-full lg:w-auto lg:flex-shrink-0" style={{ maxWidth: 440 }}>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                icon={ArrowDown}
                label={t('dashboard.download')}
                value={formatSpeed(download)}
                unit={t('dashboard.mbps')}
                color="var(--accent)"
                delay={0}
                isActive={phase === 'download'}
              />
              <MetricCard
                icon={ArrowUp}
                label={t('dashboard.upload')}
                value={formatSpeed(upload)}
                unit={t('dashboard.mbps')}
                color="var(--accent-purple)"
                delay={0.04}
                isActive={phase === 'upload'}
              />
              <MetricCard
                icon={Zap}
                label={t('dashboard.ping')}
                value={formatPing(ping)}
                unit={t('dashboard.ms')}
                color={pingColor(ping)}
                delay={0.08}
                isActive={phase === 'ping'}
              />
              <MetricCard
                icon={Activity}
                label={t('dashboard.jitter')}
                value={formatPing(jitter)}
                unit={t('dashboard.ms')}
                color="var(--accent-teal)"
                delay={0.12}
                isActive={phase === 'jitter'}
              />
              <MetricCard
                icon={AlertTriangle}
                label={t('dashboard.packetLoss')}
                value={packetLoss.toFixed(1)}
                unit={t('dashboard.percent')}
                color={packetLoss > 0 ? 'var(--accent-red)' : 'var(--accent-green)'}
                delay={0.16}
                isActive={phase === 'packetLoss'}
              />
              <MetricCard
                icon={Waves}
                label={t('dashboard.bufferbloat')}
                value={formatPing(bufferbloat)}
                unit={t('dashboard.ms')}
                color="var(--accent-orange)"
                delay={0.2}
                isActive={phase === 'bufferbloat'}
              />
              {/* DNS Speed */}
              <MetricCard
                icon={Signal}
                label="DNS"
                value={formatPing(dns)}
                unit="ms"
                color="var(--accent-blue)"
                delay={0.24}
                isActive={phase === 'dns'}
              />
              {/* Quality Score as metric */}
              {isComplete && (
                <MetricCard
                  icon={Gauge}
                  label="QUALITY"
                  value={qualityScore.toString()}
                  unit="/100"
                  color={scoreTier.color}
                  delay={0.28}
                />
              )}
            </div>

            {/* Live Speed Graph */}
            <div style={{ marginTop: 16 }}>
              <LiveSpeedGraph />
            </div>

            {/* Video Quality Estimation */}
            <AnimatePresence>
              {isComplete && latestResult && (
                <motion.div
                  className="panel"
                  style={{ padding: '16px 18px', marginTop: 16 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  {(() => {
                    const vq = getMaxVideoQuality(latestResult.download);
                    const loadTime = getEstimatedLoadTime(latestResult.download);
                    const buffering = getBufferingEstimate(latestResult.download);
                    return (
                      <>
                        <div className="section-label" style={{ marginBottom: 10 }}>
                          <Tv size={12} />
                          Max Streaming Quality
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
                            {vq.resolution}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary)' }}>
                            {vq.label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)' }}>
                            ⏱ Load Time {Math.round(loadTime)}ms
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)' }}>
                            📊 Buffering {buffering}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          {vq.devices.map((d, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <div style={{
                                width: 44, height: 44, borderRadius: 'var(--radius-sm)',
                                border: '1.5px solid var(--accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 20,
                              }}>
                                {d.icon}
                              </div>
                              <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-tertiary)', textAlign: 'center', maxWidth: 60 }}>
                                {d.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recommendations */}
            <AnimatePresence>
              {isComplete && recommendations.length > 0 && (
                <motion.div
                  className="panel"
                  style={{ padding: '14px 16px', marginTop: 16 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="section-label" style={{ marginBottom: 8 }}>
                    <Lightbulb size={12} />
                    Recommendations
                  </div>
                  <div className="flex flex-col gap-2">
                    {recommendations.map((tip, i) => (
                      <p key={i} style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--accent-orange)', marginRight: 6 }}>•</span>
                        {tip}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
