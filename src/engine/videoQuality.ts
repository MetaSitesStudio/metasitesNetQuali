/**
 * Video Quality Estimation
 * Based on measured download speed, estimate what streaming quality the connection can support.
 * Uses industry-standard bitrate recommendations from Netflix/YouTube.
 */

export interface VideoQuality {
  resolution: string;
  label: string;
  minMbps: number;
  devices: { icon: string; name: string }[];
}

const VIDEO_QUALITIES: VideoQuality[] = [
  {
    resolution: '2160p',
    label: '4K Ultra HD',
    minMbps: 25,
    devices: [
      { icon: '📱', name: 'Large phones' },
      { icon: '📲', name: 'Large tablets' },
      { icon: '💻', name: 'Large laptops' },
      { icon: '📺', name: 'Large TVs' },
    ],
  },
  {
    resolution: '1440p',
    label: 'QHD',
    minMbps: 16,
    devices: [
      { icon: '📱', name: 'Phones' },
      { icon: '📲', name: 'Tablets' },
      { icon: '💻', name: 'Laptops' },
      { icon: '📺', name: 'TVs' },
    ],
  },
  {
    resolution: '1080p',
    label: 'Full HD',
    minMbps: 5,
    devices: [
      { icon: '📱', name: 'Phones' },
      { icon: '📲', name: 'Tablets' },
      { icon: '💻', name: 'Laptops' },
    ],
  },
  {
    resolution: '720p',
    label: 'HD',
    minMbps: 2.5,
    devices: [
      { icon: '📱', name: 'Phones' },
      { icon: '📲', name: 'Tablets' },
    ],
  },
  {
    resolution: '480p',
    label: 'SD',
    minMbps: 1.1,
    devices: [
      { icon: '📱', name: 'Phones' },
    ],
  },
  {
    resolution: '360p',
    label: 'Low quality',
    minMbps: 0.7,
    devices: [
      { icon: '📱', name: 'Small phones' },
    ],
  },
];

export function getMaxVideoQuality(downloadMbps: number): VideoQuality {
  for (const q of VIDEO_QUALITIES) {
    if (downloadMbps >= q.minMbps) return q;
  }
  return VIDEO_QUALITIES[VIDEO_QUALITIES.length - 1];
}

export function getEstimatedLoadTime(downloadMbps: number): number {
  // Estimate page load time in ms — 2MB average page size
  if (downloadMbps <= 0) return 0;
  const pageSizeMB = 2;
  return (pageSizeMB * 8) / downloadMbps * 1000; // ms
}

export function getBufferingEstimate(downloadMbps: number): number {
  // Estimate buffering percentage — based on Netflix streaming needs
  // At 25+ Mbps: 0% buffering, below 5 Mbps: noticeable
  if (downloadMbps >= 25) return 0;
  if (downloadMbps >= 10) return Math.round((1 - (downloadMbps - 10) / 15) * 5);
  if (downloadMbps >= 5) return Math.round((1 - (downloadMbps - 5) / 5) * 15 + 5);
  return Math.round(Math.min(50, (1 - downloadMbps / 5) * 50 + 20));
}
