import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Trash2, TrendingUp, Clock, ArrowDown, ArrowUp, Zap, Wifi, Globe, Download, Share2 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useStore } from '../store/useStore';
import { getResultsByPeriod } from '../store/db';
import { formatSpeed, formatPing, gradeColor, timeAgo } from '../engine/utils';
import { exportHistoryCSV, shareResult } from '../engine/exportShare';
import type { TestResult } from '../types';

type Period = '24h' | '7d' | '30d';
const periodHours: Record<Period, number> = { '24h': 24, '7d': 168, '30d': 720 };

export function History() {
  const { t } = useTranslation();
  const history = useStore((s) => s.history);
  const loadHistory = useStore((s) => s.loadHistory);
  const clearHistory = useStore((s) => s.clearHistory);
  const [period, setPeriod] = useState<Period>('7d');
  const [chartData, setChartData] = useState<TestResult[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  useEffect(() => {
    getResultsByPeriod(periodHours[period]).then((d) => setChartData(d.reverse()));
  }, [period, history]);

  const handleClear = () => {
    if (showConfirm) {
      clearHistory();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div className="app-container page-body">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {t('history.title')}
          </h1>
          {history.length > 0 && (
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)', marginTop: 2 }}>
              {history.length} test{history.length !== 1 ? 's' : ''} recorded
            </p>
          )}
        </div>
        {history.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Export CSV */}
            <button
              onClick={() => exportHistoryCSV(history)}
              className="flex items-center gap-1.5 cursor-pointer"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-inset)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.15s ease',
              }}
            >
              <Download size={13} />
              Export
            </button>
            {/* Clear */}
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 cursor-pointer"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                background: showConfirm ? 'var(--accent-red)' : 'var(--bg-inset)',
                color: showConfirm ? 'white' : 'var(--text-tertiary)',
                border: `1px solid ${showConfirm ? 'var(--accent-red)' : 'var(--border)'}`,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.15s ease',
              }}
            >
              <Trash2 size={13} />
              {showConfirm ? t('history.confirmClear') : t('history.clearAll')}
            </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center"
          style={{ minHeight: 'calc(100dvh - 300px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className="flex items-center justify-center mb-5"
            style={{
              width: 72, height: 72, borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-inset)',
            }}
          >
            <Clock size={32} style={{ color: 'var(--text-tertiary)', opacity: 0.4 }} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>
            {t('history.noResults')}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>
            {t('history.noResultsDesc')}
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col xl:flex-row xl:gap-8">
          {/* CHART */}
          <div className="xl:flex-1 xl:min-w-0 mb-6 xl:mb-0">
            <div className="panel" style={{ padding: 'clamp(16px, 2.5vw, 28px)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="section-label" style={{ marginBottom: 0 }}>
                  <TrendingUp size={14} />
                  {t('history.trends')}
                </div>
                <div className="segmented">
                  {(['24h', '7d', '30d'] as Period[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`segmented-btn ${period === p ? 'segmented-btn--active' : ''}`}
                    >
                      {t(`history.period${p.charAt(0).toUpperCase() + p.slice(1)}` as any)}
                    </button>
                  ))}
                </div>
              </div>

              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="gradDl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradUl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.3} />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(v) => {
                        const d = new Date(v);
                        return period === '24h'
                          ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                      }}
                      tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        fontSize: 12,
                        boxShadow: 'var(--shadow-lg)',
                        backdropFilter: 'blur(12px)',
                      }}
                      labelFormatter={(v) => new Date(v).toLocaleString()}
                    />
                    <Area type="monotone" dataKey="download" stroke="var(--accent)" strokeWidth={2} fill="url(#gradDl)" dot={false} name="Download (Mbps)" />
                    <Area type="monotone" dataKey="upload" stroke="var(--accent-purple)" strokeWidth={1.5} fill="url(#gradUl)" dot={false} name="Upload (Mbps)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center" style={{ height: 240 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                    Need at least 2 results to show trends.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RESULTS LIST */}
          <div className="xl:w-[400px] xl:flex-shrink-0">
            <div className="panel" style={{ overflow: 'hidden' }}>
              <AnimatePresence>
                {history.map((result, i) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      padding: '14px 18px',
                      borderBottom: i < history.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      transition: 'background 0.15s ease',
                    }}
                    className="hover:bg-[var(--bg-panel-hover)]"
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-tertiary)' }}>
                          {timeAgo(result.timestamp)}
                        </span>
                        {result.qualityScore !== undefined && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace' }}>
                            {result.qualityScore}/100
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Share button */}
                        <button
                          onClick={() => shareResult(result)}
                          className="cursor-pointer"
                          style={{ background: 'none', border: 'none', padding: 2 }}
                        >
                          <Share2 size={12} style={{ color: 'var(--text-tertiary)', opacity: 0.6 }} />
                        </button>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: gradeColor(result.grade),
                            background: `color-mix(in srgb, ${gradeColor(result.grade)} 10%, transparent)`,
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-xs)',
                          }}
                        >
                          {result.grade}
                        </span>
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <ArrowDown size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>
                            {formatSpeed(result.download)}
                          </p>
                          <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 1 }}>Mbps ↓</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowUp size={13} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>
                            {formatSpeed(result.upload)}
                          </p>
                          <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 1 }}>Mbps ↑</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap size={13} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>
                            {formatPing(result.ping)}
                          </p>
                          <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 1 }}>ms</p>
                        </div>
                      </div>
                    </div>

                    {/* ISP row */}
                    {(result.isp || result.connectionType) && (
                      <div className="flex items-center gap-3 mt-2" style={{ paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                        {result.connectionType && (
                          <span className="flex items-center gap-1" style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-tertiary)' }}>
                            <Wifi size={10} style={{ color: 'var(--accent)' }} /> {result.connectionType}
                          </span>
                        )}
                        {result.isp && result.isp !== 'Unknown' && (
                          <span className="flex items-center gap-1 truncate" style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-tertiary)' }}>
                            <Globe size={10} style={{ color: 'var(--accent-purple)' }} /> {result.isp}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
