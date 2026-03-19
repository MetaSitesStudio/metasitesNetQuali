import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdSlide {
  id: string;
  imageUrl: string;
  linkUrl: string;
  alt: string;
}

const FALLBACK_SLIDES: AdSlide[] = [
  { id: 'ad-1', imageUrl: '/ads/ad-1.png', linkUrl: 'https://adgenerator.online?ref=speedfox', alt: 'MetaSites AdGenerator' },
  { id: 'ad-2', imageUrl: '/ads/ad-2.png', linkUrl: 'https://metasites.io?ref=speedfox', alt: 'MetaSites Studio' },
  { id: 'ad-3', imageUrl: '/ads/ad-3.png', linkUrl: 'https://speedfox.app/pro?ref=speedfox', alt: 'SpeedFox Pro' },
  { id: 'ad-4', imageUrl: '/ads/ad-4.png', linkUrl: 'https://metasites.io/seo?ref=speedfox', alt: 'MetaSites SEO' },
  { id: 'ad-5', imageUrl: '/ads/ad-5.png', linkUrl: 'https://metasites.io/agency?ref=speedfox', alt: 'MetaSites Agency' },
];

const CAROUSEL_URL = import.meta.env.VITE_AD_CAROUSEL_URL || '/ad-carousel.json';
const AUTO_INTERVAL = 5000;

export function AdCarousel() {
  const [slides, setSlides] = useState<AdSlide[]>(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  // Load config at mount
  useEffect(() => {
    const controller = new AbortController();
    fetch(CAROUSEL_URL, { signal: controller.signal })
      .then((r) => r.json() as Promise<{ slides: AdSlide[] }>)
      .then((config) => {
        if (config.slides?.length) setSlides(config.slides);
      })
      .catch(() => {}); // use fallback silently
    return () => controller.abort();
  }, []);

  const goTo = useCallback((index: number, dir: number) => {
    setDirection(dir);
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length, 1);
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, -1);
  }, [current, slides.length, goTo]);

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <div
      style={{
        width: 300,
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}
    >
      {/* Image area */}
      <div style={{ position: 'relative', aspectRatio: '9 / 16', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.a
            key={slide.id}
            href={slide.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ display: 'block', position: 'absolute', inset: 0 }}
          >
            <img
              src={slide.imageUrl}
              alt={slide.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </motion.a>
        </AnimatePresence>

        {/* Nav arrows */}
        <button
          onClick={(e) => { e.preventDefault(); prev(); }}
          style={{
            position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 3, backdropFilter: 'blur(4px)',
          }}
        >
          <ChevronLeft size={14} color="white" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); next(); }}
          style={{
            position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 3, backdropFilter: 'blur(4px)',
          }}
        >
          <ChevronRight size={14} color="white" />
        </button>
      </div>

      {/* Dot indicators */}
      <div
        className="flex items-center justify-center"
        style={{ padding: '10px 0', gap: 6 }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            style={{
              width: i === current ? 16 : 6,
              height: 6,
              borderRadius: 3,
              background: i === current ? 'var(--accent)' : 'var(--border)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Subtle label */}
      <span style={{
        position: 'absolute', top: 8, right: 10,
        fontSize: 8, fontWeight: 600,
        color: 'rgba(255,255,255,0.35)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        zIndex: 4,
      }}>
        Ad
      </span>
    </div>
  );
}
