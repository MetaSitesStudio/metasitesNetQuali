import { motion } from 'framer-motion';
import { Play, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TestButtonProps {
  isRunning: boolean;
  onClick: () => void;
}

export function TestButton({ isRunning, onClick }: TestButtonProps) {
  const { t } = useTranslation();

  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
      {/* Pulse ring — decorative only */}
      {!isRunning && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: '1.5px solid var(--accent)', opacity: 0.2 }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Running ring */}
      {isRunning && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: '1.5px solid var(--accent-orange)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-orange)' }}
          />
        </motion.div>
      )}

      {/* Button */}
      <motion.button
        onClick={onClick}
        className="relative rounded-full flex items-center justify-center cursor-pointer"
        style={{
          width: 56,
          height: 56,
          background: isRunning
            ? 'linear-gradient(135deg, var(--accent-orange), var(--accent-red))'
            : 'linear-gradient(135deg, var(--accent), var(--accent-purple))',
          border: 'none',
          boxShadow: isRunning
            ? '0 4px 20px rgba(249, 115, 22, 0.3)'
            : '0 4px 20px rgba(6, 182, 212, 0.25)',
          zIndex: 10,
        }}
        whileTap={{ scale: 0.88 }}
        whileHover={{
          scale: 1.06,
          boxShadow: isRunning
            ? '0 6px 28px rgba(249, 115, 22, 0.4)'
            : '0 6px 28px rgba(6, 182, 212, 0.35)',
        }}
        aria-label={isRunning ? t('dashboard.stopTest') : t('dashboard.startTest')}
      >
        {isRunning ? (
          <Square size={18} color="white" fill="white" />
        ) : (
          <Play size={22} color="white" fill="white" style={{ marginLeft: 2 }} />
        )}
      </motion.button>
    </div>
  );
}
