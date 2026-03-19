import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowDown,
  ArrowUp,
  Zap,
  Activity,
  AlertTriangle,
  Waves,
  Signal,
  Gauge,
  Award,
  RotateCcw,
  Share2,
  Lightbulb,
  Tv,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { SpeedFoxMascot } from '../components/SpeedFoxMascot';
import { MetricCard } from '../components/MetricCard';
import { PromoWidgetSlot } from '../components/PromoWidgetSlot';
import { formatSpeed, formatPing, gradeColor, pingColor } from '../engine/utils';
import { getScoreTier, getPlanUtilization, getRecommendations } from '../engine/qualityScore';
import { shareResult } from '../engine/exportShare';
import { getMaxVideoQuality, getEstimatedLoadTime, getBufferingEstimate } from '../engine/videoQuality';

/** Generate a 1-line mascot reaction based on grade */
function getMascotReaction(grade: string): string {
  switch (grade) {
    case 'excellent': return 'Outstanding performance. Your connection is rock solid.';
    case 'good': return 'Solid performance overall. Looking good.';
    case 'fair': return 'Decent speeds, but there\u2019s room for improvement.';
    case 'poor': return 'Your connection needs attention. See recommendations below.';
    default: return 'Analysis complete.';
  }
}

export function ResultsScreen() {
  const { t } = useTranslation();
  const latestResult = useStore((s) => s.latestResult);
  const ispSpeed = useStore((s) => s.ispSpeed);
  const setScreenFlow = useStore((s) => s.setScreenFlow);

  if (!latestResult) return null;

  const { download, upload, ping, jitter, packetLoss, bufferbloat, grade, dnsSpeed } = latestResult;
  const qualityScore = latestResult.qualityScore ?? 0;
  const scoreTier = getScoreTier(qualityScore);
  const planUtil = ispSpeed > 0 ? getPlanUtilization(download, ispSpeed) : 0;
  const recommendations = getRecommendations(latestResult, ispSpeed);
  const mascotState = (grade === 'excellent' || grade === 'good') ? 'success' as const : 'warning' as const;
  const vq = getMaxVideoQuality(download);
  const loadTime = getEstimatedLoadTime(download);
  const buffering = getBufferingEstimate(download);

  const handleTestAgain = () => {
    useStore.getState().resetTest();
    setScreenFlow('scan');
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px 80px' }}>

      {/* ═══════════════════════════════════════════════════
          ZONE A — RESULT REPORT (upper section)
          ═══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* 2-column desktop: LEFT = mascot reaction | RIGHT = verdict + data */}
        <div
          className="results-hero-grid"
          style={{ paddingTop: 24, marginBottom: 40 }}
        >
          {/* ── LEFT COLUMN: Mascot + Reaction ── */}
          <div
            className="hidden lg:flex flex-col items-center justify-start"
            style={{ paddingTop: 16, gap: 24 }}
          >
            <SpeedFoxMascot state={mascotState} />

            {/* Reaction text */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                textAlign: 'center',
                maxWidth: 280,
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <p style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                margin: 0,
              }}>
                {getMascotReaction(grade)}
              </p>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN: Verdict + Metrics + Insights ── */}
          <div>
            {/* ▸ Verdict block — the hero of the results page */}
            <div
              className="panel"
              style={{
                padding: '28px 32px',
                marginBottom: 24,
                borderLeft: `3px solid ${scoreTier.color}`,
              }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center" style={{ gap: 20 }}>
                {/* Score circle */}
                <div
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: '50%',
                    background: `color-mix(in srgb, ${scoreTier.color} 10%, transparent)`,
                    border: `3px solid color-mix(in srgb, ${scoreTier.color} 40%, transparent)`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 36, fontWeight: 800, color: scoreTier.color, lineHeight: 1 }}>
                    {qualityScore}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    / 100
                  </span>
                </div>

                {/* Verdict text */}
                <div className="flex-1">
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.01em' }}>
                    {scoreTier.label}
                  </div>
                  <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                    <Award size={16} style={{ color: gradeColor(grade) }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: gradeColor(grade) }}>
                      {t(`dashboard.${grade}`)} Quality
                    </span>
                  </div>

                  {/* ISP plan utilization — inline if available */}
                  {ispSpeed > 0 && (
                    <div style={{ maxWidth: 240, marginTop: 8 }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)' }}>ISP Plan Usage</span>
                        <span style={{
                          fontSize: 12, fontWeight: 700,
                          color: planUtil >= 80 ? 'var(--accent-green)' : planUtil >= 50 ? 'var(--accent-orange)' : 'var(--accent-red)',
                        }}>
                          {planUtil}%
                        </span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: 'var(--gauge-track)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 2,
                          width: `${Math.min(planUtil, 100)}%`,
                          background: planUtil >= 80 ? 'var(--accent-green)' : planUtil >= 50 ? 'var(--accent-orange)' : 'var(--accent-red)',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons — right-aligned on desktop */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <motion.button
                    onClick={handleTestAgain}
                    className="flex items-center gap-2 cursor-pointer"
                    style={{
                      padding: '10px 20px',
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
                  <motion.button
                    onClick={() => shareResult(latestResult)}
                    className="flex items-center gap-2 cursor-pointer"
                    style={{
                      padding: '10px 16px',
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
                </div>
              </div>
            </div>

            {/* ▸ Metric cards — 4-col grid */}
            <div
              className="grid grid-cols-2 lg:grid-cols-4"
              style={{ gap: 12, marginBottom: 24 }}
            >
              <MetricCard icon={ArrowDown} label={t('dashboard.download')} value={formatSpeed(download)} unit={t('dashboard.mbps')} color="var(--accent)" delay={0.05} />
              <MetricCard icon={ArrowUp} label={t('dashboard.upload')} value={formatSpeed(upload)} unit={t('dashboard.mbps')} color="var(--accent-purple)" delay={0.1} />
              <MetricCard icon={Zap} label={t('dashboard.ping')} value={formatPing(ping)} unit={t('dashboard.ms')} color={pingColor(ping)} delay={0.15} />
              <MetricCard icon={Activity} label={t('dashboard.jitter')} value={formatPing(jitter)} unit={t('dashboard.ms')} color="var(--accent-teal)" delay={0.2} />
              <MetricCard icon={AlertTriangle} label={t('dashboard.packetLoss')} value={packetLoss.toFixed(1)} unit={t('dashboard.percent')} color={packetLoss > 0 ? 'var(--accent-red)' : 'var(--accent-green)'} delay={0.25} />
              <MetricCard icon={Waves} label={t('dashboard.bufferbloat')} value={formatPing(bufferbloat)} unit={t('dashboard.ms')} color="var(--accent-orange)" delay={0.3} />
              <MetricCard icon={Signal} label="DNS" value={formatPing(dnsSpeed ?? 0)} unit="ms" color="var(--accent-blue)" delay={0.35} />
              <MetricCard icon={Gauge} label="QUALITY" value={qualityScore.toString()} unit="/100" color={scoreTier.color} delay={0.4} />
            </div>

            {/* ▸ Interpretation row: Streaming + Recommendations side by side */}
            <div
              className="grid grid-cols-1 lg:grid-cols-2"
              style={{ gap: 16, marginBottom: 0 }}
            >
              {/* Streaming quality */}
              <div className="panel" style={{ padding: '18px 22px' }}>
                <div className="section-label" style={{ marginBottom: 12 }}>
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
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)' }}>
                    ⏱ Load {Math.round(loadTime)}ms
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)' }}>
                    📊 Buffer {buffering}%
                  </span>
                </div>
                {/* Device icons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                  {vq.devices.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 16 }}>{d.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)' }}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {recommendations.length > 0 ? (
                <div className="panel" style={{ padding: '18px 22px' }}>
                  <div className="section-label" style={{ marginBottom: 12 }}>
                    <Lightbulb size={12} />
                    Recommendations
                  </div>
                  <div className="flex flex-col gap-3">
                    {recommendations.map((tip, i) => (
                      <p key={i} style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        <span style={{ color: 'var(--accent-orange)', marginRight: 8, fontWeight: 700 }}>→</span>
                        {tip}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="panel" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)', textAlign: 'center' }}>
                    ✓ No issues detected. Your connection looks healthy.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════
          ZONE B — PROMOTIONAL / BRAND (lower section)
          ═══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{ marginTop: 48 }}
      >
        {/* Separator */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
          marginBottom: 40,
        }} />

        <PromoWidgetSlot />
      </motion.div>
    </div>
  );
}
