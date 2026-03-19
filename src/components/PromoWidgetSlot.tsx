import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PromoWidget {
  id: string;
  active: boolean;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl: string;
  backgroundStyle?: string;
}

interface WidgetConfig {
  widgets: PromoWidget[];
}

const WIDGET_URL = import.meta.env.VITE_PROMO_WIDGET_URL || '/promo-widgets.json';

const FALLBACK_WIDGET: PromoWidget = {
  id: 'metasites-default',
  active: true,
  imageUrl: '/banner/adgenerator_banner.jpg',
  ctaUrl: 'https://adgenerator.online',
};

export function PromoWidgetSlot() {
  const [widget, setWidget] = useState<PromoWidget>(FALLBACK_WIDGET);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(WIDGET_URL, { signal: controller.signal })
      .then((r) => r.json() as Promise<WidgetConfig>)
      .then((config) => {
        const active = config.widgets?.find((w) => w.active);
        if (active) setWidget(active);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
    return () => controller.abort();
  }, []);

  return (
    <motion.a
      href={widget.ctaUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 16 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'block',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      <img
        src={widget.imageUrl}
        alt={widget.title || 'Sponsored'}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: 16,
        }}
      />
    </motion.a>
  );
}
