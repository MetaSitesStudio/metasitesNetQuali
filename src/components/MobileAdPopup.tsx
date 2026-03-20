import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { FALLBACK_SLIDES, type AdSlide } from './AdCarousel';

const SESSION_KEY = 'speedfox-mobile-ad-shown';

function pickRandom(slides: AdSlide[]): AdSlide | null {
  if (!slides || slides.length === 0) return null;
  return slides[Math.floor(Math.random() * slides.length)];
}

/**
 * Mobile-only popup that shows a single random ad.
 * Appears once per session, only on screens < 1024px (same breakpoint as lg:).
 */
export function MobileAdPopup() {
  const [visible, setVisible] = useState(false);
  const [ad, setAd] = useState<AdSlide | null>(null);

  useEffect(() => {
    // Skip if already shown this session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Skip on desktop (same breakpoint as Tailwind `lg:`)
    const mq = window.matchMedia('(max-width: 1023px)');
    if (!mq.matches) return;

    // Try to load ads from the same JSON the carousel uses, fallback to hardcoded slides
    const controller = new AbortController();
    const loadAndShow = async () => {
      let slides: AdSlide[] = FALLBACK_SLIDES;

      try {
        const res = await fetch('/ad-carousel.json', { signal: controller.signal });
        const data = await res.json() as { slides?: AdSlide[] };
        if (data.slides && data.slides.length > 0) {
          slides = data.slides;
        }
      } catch {
        // Use fallback slides silently
      }

      const picked = pickRandom(slides);
      if (!picked) return; // No ads available

      setAd(picked);
      // Small delay so results page is visible first
      setTimeout(() => setVisible(true), 2000);
    };

    loadAndShow();
    return () => controller.abort();
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, '1');
  };

  // Don't render anything if no ad was picked
  if (!ad) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={dismiss}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            padding: 24,
          }}
        >
          {/* Card — stop click from propagating so tapping the ad doesn't dismiss */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 280,
              borderRadius: 16,
              overflow: 'hidden',
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Close button */}
            <button
              onClick={dismiss}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 5,
                backdropFilter: 'blur(4px)',
              }}
            >
              <X size={14} color="white" />
            </button>

            {/* "Ad" label */}
            <span
              style={{
                position: 'absolute',
                top: 8,
                left: 10,
                fontSize: 8,
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.35)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                zIndex: 4,
              }}
            >
              Ad
            </span>

            {/* Ad image */}
            <a
              href={ad.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block' }}
            >
              <img
                src={ad.imageUrl}
                alt={ad.alt}
                style={{
                  width: '100%',
                  aspectRatio: '9 / 16',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
