import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  color?: string;
  delay?: number;
  isActive?: boolean;
}

export function MetricCard({ icon: Icon, label, value, unit, color = 'var(--accent)', delay = 0, isActive = false }: MetricCardProps) {
  return (
    <motion.div
      className="panel panel--hover"
      style={{ padding: '14px 16px' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: `color-mix(in srgb, ${color} 10%, transparent)`,
          }}
        >
          <Icon size={17} style={{ color }} strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-tertiary)',
              marginBottom: 2,
            }}
          >
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <motion.span
              style={{
                fontSize: 20,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
              }}
              key={value}
              initial={isActive ? { scale: 1.05 } : {}}
              animate={{ scale: 1 }}
              transition={{ duration: 0.12 }}
            >
              {value}
            </motion.span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)' }}>
              {unit}
            </span>
          </div>
        </div>

        {/* Active indicator */}
        {isActive && (
          <motion.div
            className="flex-shrink-0"
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: color,
            }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}
