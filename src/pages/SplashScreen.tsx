import { motion } from 'framer-motion';
import { SpeedFoxMascot } from '../components/SpeedFoxMascot';
import { useStore } from '../store/useStore';
import { useEffect } from 'react';

export function SplashScreen() {
  const setScreenFlow = useStore((s) => s.setScreenFlow);

  // Auto-advance after 3.5s
  useEffect(() => {
    const timer = setTimeout(() => setScreenFlow('scan'), 3500);
    return () => clearTimeout(timer);
  }, [setScreenFlow]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow behind mascot */}
      <motion.div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Mascot */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <SpeedFoxMascot state="idle" />
      </motion.div>

      {/* Brand text */}
      <motion.div
        className="flex flex-col items-center"
        style={{ marginTop: -16, position: 'relative', zIndex: 2 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <img
          src="/logo_speedfox.png"
          alt="Speedfox"
          style={{ height: 40, marginBottom: 12 }}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-tertiary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Powered by MetaSites Studio
        </span>
      </motion.div>

      {/* Skip CTA */}
      <motion.button
        onClick={() => setScreenFlow('scan')}
        style={{
          position: 'absolute',
          bottom: 48,
          padding: '10px 24px',
          borderRadius: 999,
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--text-tertiary)',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        whileHover={{ background: 'var(--bg-inset)', color: 'var(--text-secondary)' }}
      >
        Skip →
      </motion.button>
    </div>
  );
}
