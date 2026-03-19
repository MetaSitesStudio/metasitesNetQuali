import { motion } from 'framer-motion';
import { speedColor, formatSpeed, formatSpeedUnit } from '../engine/utils';

interface SpeedGaugeProps {
  speed: number;
  label: string;
  isActive?: boolean;
}

export function SpeedGauge({ speed, label, isActive = false }: SpeedGaugeProps) {
  const color = speedColor(speed);
  const maxSpeed = 500;
  const pct = Math.min(speed / maxSpeed, 1);
  const svgSize = 280;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const r = 110;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * r;
  const arcPct = 0.75; // 270°
  const dashTotal = circumference * arcPct;
  const dashOffset = dashTotal - dashTotal * pct;
  const startAngle = 135;

  return (
    <div className="gauge-container" style={{ width: '100%', maxWidth: 320, margin: '0 auto' }}>
      <svg
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className={isActive ? 'gauge-glow' : ''}
        style={{ width: '100%', height: 'auto' }}
      >
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="50%" stopColor="var(--accent-blue)" />
            <stop offset="100%" stopColor="var(--accent-purple)" />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--gauge-track)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${dashTotal} ${circumference - dashTotal}`}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${cx} ${cy})`}
          opacity={0.5}
        />

        {/* Active arc */}
        <motion.circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={strokeWidth + 1}
          strokeDasharray={`${dashTotal} ${circumference - dashTotal}`}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${cx} ${cy})`}
          initial={{ strokeDashoffset: dashTotal }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Speed value */}
        <text
          x={cx} y={cy - 10}
          textAnchor="middle"
          dominantBaseline="central"
          fill={speed > 0 ? color : 'var(--text-tertiary)'}
          fontSize="46"
          fontWeight="800"
          fontFamily="var(--font-sans)"
        >
          {formatSpeed(speed)}
        </text>

        {/* Unit */}
        <text
          x={cx} y={cy + 22}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-tertiary)"
          fontSize="12"
          fontWeight="700"
          letterSpacing="3"
          fontFamily="var(--font-sans)"
        >
          {formatSpeedUnit(speed).toUpperCase()}
        </text>

        {/* Label */}
        <text
          x={cx} y={cy + 42}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-secondary)"
          fontSize="12"
          fontWeight="600"
          fontFamily="var(--font-sans)"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
