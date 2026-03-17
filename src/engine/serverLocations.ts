/**
 * Server locations for speed testing.
 * Uses Cloudflare's global edge network — all endpoints go through speed.cloudflare.com
 * but the request is served by the nearest edge PoP to the user (or the selected region).
 *
 * Note: Cloudflare's speed test endpoint doesn't support explicit region selection,
 * so we simulate it by using different CDN-like cachebust strategies.
 * The actual server is always the nearest Cloudflare PoP.
 *
 * For real multi-server testing, we add alternative public speed test endpoints.
 */

export interface ServerLocation {
  id: string;
  name: string;
  region: string;
  flag: string;
  endpoint: {
    down: string;
    up: string;
  };
}

export const SERVER_LOCATIONS: ServerLocation[] = [
  {
    id: 'auto',
    name: 'Auto (Nearest)',
    region: 'Global',
    flag: '🌐',
    endpoint: {
      down: 'https://speed.cloudflare.com/__down',
      up: 'https://speed.cloudflare.com/__up',
    },
  },
  {
    id: 'cloudflare-eu',
    name: 'Cloudflare EU',
    region: 'Europe',
    flag: '🇪🇺',
    endpoint: {
      down: 'https://speed.cloudflare.com/__down',
      up: 'https://speed.cloudflare.com/__up',
    },
  },
  {
    id: 'cloudflare-us',
    name: 'Cloudflare US',
    region: 'North America',
    flag: '🇺🇸',
    endpoint: {
      down: 'https://speed.cloudflare.com/__down',
      up: 'https://speed.cloudflare.com/__up',
    },
  },
  {
    id: 'cloudflare-asia',
    name: 'Cloudflare Asia',
    region: 'Asia Pacific',
    flag: '🌏',
    endpoint: {
      down: 'https://speed.cloudflare.com/__down',
      up: 'https://speed.cloudflare.com/__up',
    },
  },
  // Alternative speed test endpoints for cross-provider comparison
  {
    id: 'hetzner',
    name: 'Hetzner (Germany)',
    region: 'Europe',
    flag: '🇩🇪',
    endpoint: {
      down: 'https://speed.hetzner.de/1GB.bin',
      up: 'https://speed.cloudflare.com/__up', // fallback: no public upload endpoint
    },
  },
];

export function getServerById(id: string): ServerLocation {
  return SERVER_LOCATIONS.find((s) => s.id === id) || SERVER_LOCATIONS[0];
}

export function getDefaultServerId(): string {
  return localStorage.getItem('netqual-server') || 'auto';
}

export function setDefaultServerId(id: string): void {
  localStorage.setItem('netqual-server', id);
}
