import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { SplashScreen } from './SplashScreen';
import { ScanScreen } from './ScanScreen';
import { ResultsScreen } from './ResultsScreen';

/**
 * Dashboard is now a slim flow controller.
 * It renders one of three screens based on `screenFlow` state:
 *   splash → scan → results
 */
export function Dashboard() {
  const screenFlow = useStore((s) => s.screenFlow);

  return (
    <AnimatePresence mode="wait">
      {screenFlow === 'splash' && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SplashScreen />
        </motion.div>
      )}
      {screenFlow === 'scan' && (
        <motion.div
          key="scan"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          <ScanScreen />
        </motion.div>
      )}
      {screenFlow === 'results' && (
        <motion.div
          key="results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          <ResultsScreen />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
