import { motion } from 'framer-motion';
import { SpeedFoxMascot } from '../components/SpeedFoxMascot';
import { useStore } from '../store/useStore';

export function SplashScreen() {
  const setScreenFlow = useStore((s) => s.setScreenFlow);

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

      {/* Brand + Value Proposition */}
      <motion.div
        className="flex flex-col items-center"
        style={{ marginTop: -16, position: 'relative', zIndex: 2, maxWidth: 480, textAlign: 'center' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <img
          src="/logo_speedfox.png"
          alt="SpeedFox"
          style={{ height: 40, marginBottom: 20 }}
        />

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: '0 0 12px',
          }}
        >
          How good is your internet, really?
        </h1>

        {/* Subline */}
        <p
          style={{
            fontSize: 'clamp(13px, 2vw, 15px)',
            fontWeight: 400,
            color: 'var(--text-tertiary)',
            lineHeight: 1.6,
            margin: '0 0 32px',
            maxWidth: 400,
          }}
        >
          Free deep analysis — speed, stability, latency, streaming quality.
          <br />30 seconds. No signup.
        </p>

        {/* Primary CTA */}
        <motion.button
          onClick={() => setScreenFlow('scan')}
          style={{
            padding: '14px 36px',
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
        >
          Analyze My Connection
        </motion.button>
      </motion.div>

      {/* Attribution */}
      <motion.span
        style={{
          position: 'absolute',
          bottom: 32,
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--text-tertiary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          opacity: 0.6,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
      >
        Powered by MetaSites Studio
      </motion.span>
    </div>
  );
}
