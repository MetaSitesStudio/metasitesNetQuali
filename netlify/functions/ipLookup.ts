import type { Handler } from '@netlify/functions';

const TIMEOUT_MS = 3000;

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export const handler: Handler = async () => {
  // Try ipapi.co first (HTTPS, free tier 1000/day)
  try {
    const res = await fetchWithTimeout('https://ipapi.co/json/', TIMEOUT_MS);
    if (res.ok) {
      const data = await res.json();
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          ip: data.ip || '',
          isp: data.org || data.asn || 'Unknown',
          org: data.org || '',
        }),
      };
    }
  } catch { /* fall through */ }

  // Fallback: ipwho.is (HTTPS, no rate limit)
  try {
    const res = await fetchWithTimeout('https://ipwho.is/', TIMEOUT_MS);
    if (res.ok) {
      const data = await res.json();
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          ip: data.ip || '',
          isp: data.connection?.isp || data.connection?.org || 'Unknown',
          org: data.connection?.org || '',
        }),
      };
    }
  } catch { /* fall through */ }

  return {
    statusCode: 500,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'IP lookup failed', ip: '', isp: 'Unknown', org: '' }),
  };
};
