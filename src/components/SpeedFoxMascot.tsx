import { motion, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';

type MascotState = 'idle' | 'scanning' | 'success' | 'warning';

interface SpeedFoxMascotProps {
  state: MascotState;
  className?: string;
}

/* ───────────────────────────────────────────
   GLOW COLORS PER STATE
   ─────────────────────────────────────────── */
const glowMap: Record<MascotState, string> = {
  idle:     '0 0 40px rgba(59,130,246,0.20)',
  scanning: '0 0 60px rgba(6,182,212,0.35), 0 0 120px rgba(59,130,246,0.15)',
  success:  '0 0 50px rgba(34,197,94,0.35), 0 0 100px rgba(34,197,94,0.12)',
  warning:  '0 0 40px rgba(245,158,11,0.25)',
};

/* ───────────────────────────────────────────
   VARIANTS — the heart of the animation system
   ─────────────────────────────────────────── */
const mascotVariants: Variants = {
  idle: {
    scale: [1, 1.02, 1],
    y: [0, -4, 0],
    rotate: 0,
    transition: {
      scale: { duration: 3, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' },
      y:     { duration: 3.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' },
      rotate: { duration: 0.4, ease: 'easeOut' },
    },
  },
  scanning: {
    scale: [1, 1.03, 1],
    y: [0, -3, 0],
    rotate: [0, -1.5, 1.5, 0],
    transition: {
      scale:  { duration: 1.4, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' },
      y:      { duration: 1.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' },
      rotate: { duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' },
    },
  },
  success: {
    scale: [1, 1.06, 1.02],
    y: [0, -8, -2],
    rotate: [0, -2, 0],
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1], // spring-like overshoot
    },
  },
  warning: {
    scale: [1, 0.98, 1],
    y: [0, 2, 0],
    rotate: [0, 1.5, -1, 0],
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
    },
  },
};

/* ───────────────────────────────────────────
   GLOW BACKDROP VARIANTS
   ─────────────────────────────────────────── */
const glowVariants: Variants = {
  idle: {
    opacity: [0.3, 0.5, 0.3],
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
  scanning: {
    opacity: [0.4, 0.8, 0.4],
    scale: [1, 1.15, 1],
    transition: {
      duration: 1.2,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
  success: {
    opacity: [0.5, 1, 0.6],
    scale: [1, 1.2, 1.05],
    transition: {
      duration: 0.7,
      ease: 'easeOut',
    },
  },
  warning: {
    opacity: [0.3, 0.5, 0.35],
    scale: [1, 1.02, 1],
    transition: {
      duration: 0.9,
      ease: 'easeInOut',
    },
  },
};

/* ───────────────────────────────────────────
   COMPONENT
   ─────────────────────────────────────────── */
export function SpeedFoxMascot({ state, className }: SpeedFoxMascotProps) {
  // Keep glow color reactive
  const [glowShadow, setGlowShadow] = useState(glowMap.idle);

  useEffect(() => {
    setGlowShadow(glowMap[state]);
  }, [state]);

  return (
    <div className={className} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow backdrop — behind the mascot */}
      <motion.div
        variants={glowVariants}
        animate={state}
        style={{
          position: 'absolute',
          inset: '15%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Mascot image */}
      <motion.img
        src="/SpeedFox_hero.webp"
        alt="Speedfox Mascot"
        variants={mascotVariants}
        animate={state}
        draggable={false}
        style={{
          height: 'clamp(340px, 60vh, 660px)',
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
          filter: `drop-shadow(${glowShadow}) drop-shadow(0 8px 24px rgba(0,0,0,0.35))`,
          transition: 'filter 0.6s ease',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
