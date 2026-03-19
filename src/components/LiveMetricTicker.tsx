import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowUp,
  Zap,
  Activity,
  AlertTriangle,
  Waves,
  Signal,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatSpeed, formatPing } from '../engine/utils';

interface MetricItem {
  icon: typeof Zap;
  label: string;
  value: string;
  unit: string;
  color: string;
  active: boolean;
}

export function LiveMetricTicker() {
  const phase = useStore((s) => s.phase);
  const download = useStore((s) => s.currentDownload);
  const upload = useStore((s) => s.currentUpload);
  const ping = useStore((s) => s.currentPing);
  const jitter = useStore((s) => s.currentJitter);
  const packetLoss = useStore((s) => s.currentPacketLoss);
  const bufferbloat = useStore((s) => s.currentBufferbloat);
  const dns = useStore((s) => s.currentDns);

  const metrics: MetricItem[] = [
    { icon: ArrowDown, label: 'DL', value: formatSpeed(download), unit: 'Mbps', color: 'var(--accent)', active: phase === 'download' },
    { icon: ArrowUp, label: 'UL', value: formatSpeed(upload), unit: 'Mbps', color: 'var(--accent-purple)', active: phase === 'upload' },
    { icon: Zap, label: 'Ping', value: formatPing(ping), unit: 'ms', color: 'var(--accent-teal)', active: phase === 'ping' },
    { icon: Activity, label: 'Jitter', value: formatPing(jitter), unit: 'ms', color: 'var(--accent-orange)', active: phase === 'jitter' },
    { icon: AlertTriangle, label: 'Loss', value: packetLoss.toFixed(1), unit: '%', color: packetLoss > 0 ? 'var(--accent-red)' : 'var(--accent-green)', active: phase === 'packetLoss' },
    { icon: Waves, label: 'Bloat', value: formatPing(bufferbloat), unit: 'ms', color: 'var(--accent-orange)', active: phase === 'bufferbloat' },
    { icon: Signal, label: 'DNS', value: formatPing(dns), unit: 'ms', color: 'var(--accent-blue)', active: phase === 'dns' },
  ];

  return (
    <motion.div
      className="flex flex-wrap items-center justify-center"
      style={{ gap: 12, maxWidth: 600 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {metrics.map(({ icon: Icon, label, value, unit, color, active }) => (
        <div
          key={label}
          className="flex items-center gap-1.5"
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-xs)',
            background: active ? `color-mix(in srgb, ${color} 10%, transparent)` : 'var(--bg-panel)',
            border: active ? `1px solid color-mix(in srgb, ${color} 30%, transparent)` : '1px solid var(--border-subtle)',
            transition: 'all 0.2s ease',
          }}
        >
          <Icon size={11} style={{ color, flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            {label}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: active ? color : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </span>
          <span style={{ fontSize: 9, fontWeight: 500, color: 'var(--text-tertiary)' }}>
            {unit}
          </span>
        </div>
      ))}
    </motion.div>
  );
}
