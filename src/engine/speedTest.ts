import { useStore } from '../store/useStore';
import type { TestResult } from '../types';
import { getGrade, getConnectionType, detectISP, generateId } from './utils';
import { computeQualityScore } from './qualityScore';
import { getServerById, getDefaultServerId } from './serverLocations';

let abortController: AbortController | null = null;

/**
 * Client-side speed test engine.
 * Uses configurable server endpoints with MULTI-CONNECTION parallel streams
 * to saturate bandwidth and get accurate measurements (same technique as speedtest.net/fast.com).
 */

function getEndpoints() {
  const server = getServerById(getDefaultServerId());
  return { CF_DOWN: server.endpoint.down, CF_UP: server.endpoint.up, serverName: server.name };
}

// === DOWNLOAD ===
async function measureDownload(
  onProgress: (mbps: number, progress: number) => void,
  signal: AbortSignal,
): Promise<number> {
  const { CF_DOWN } = getEndpoints();
  const TEST_DURATION = 12000;
  const PARALLEL = 4;
  const startTime = performance.now();

  let chunkSize = 256 * 1024; // Start with 256KB — adapts up for fast connections
  let totalBytes = 0;
  let measureBytes = 0;
  let measureStart = 0;
  let warmupDone = false;
  let chunkCount = 0;

  async function downloadWorker(id: number) {
    while (performance.now() - startTime < TEST_DURATION && !signal.aborted) {
      try {
        const response = await fetch(
          `${CF_DOWN}?bytes=${chunkSize}&cachebust=${Date.now()}-${id}-${Math.random()}`,
          { signal, cache: 'no-store', mode: 'cors' },
        );
        if (!response.ok) throw new Error('fetch failed');
        const data = await response.arrayBuffer();
        const elapsed = (performance.now() - startTime) / 1000;
        totalBytes += data.byteLength;
        chunkCount++;

        // Discard first 2 chunks as warmup for accuracy
        if (chunkCount > 2 && !warmupDone) {
          warmupDone = true;
          measureStart = performance.now();
        }
        if (warmupDone) measureBytes += data.byteLength;

        // Adaptive chunk sizing
        const instantMbps = elapsed > 0 ? (totalBytes * 8) / (elapsed * 1_000_000) : 0;
        if (instantMbps > 50 && chunkSize < 4 * 1024 * 1024) chunkSize = Math.min(chunkSize * 2, 4 * 1024 * 1024);
        else if (instantMbps > 10 && chunkSize < 2 * 1024 * 1024) chunkSize = Math.min(chunkSize * 2, 2 * 1024 * 1024);
        else if (instantMbps < 2 && chunkSize > 128 * 1024) chunkSize = Math.max(128 * 1024, chunkSize / 2);
      } catch {
        try {
          const response = await fetch(
            `${CF_DOWN}?bytes=${128 * 1024}&cachebust=${Date.now()}-${id}-fb`,
            { signal, cache: 'no-store' },
          );
          const data = await response.arrayBuffer();
          totalBytes += data.byteLength;
          if (warmupDone) measureBytes += data.byteLength;
          chunkSize = 128 * 1024;
        } catch { /* skip */ }
      }
    }
  }

  const workers: Promise<void>[] = [];
  for (let i = 0; i < PARALLEL; i++) workers.push(downloadWorker(i));

  const progressInterval = setInterval(() => {
    let currentMbps: number;
    if (warmupDone && measureStart > 0) {
      const measureElapsed = (performance.now() - measureStart) / 1000;
      currentMbps = measureElapsed > 0 ? (measureBytes * 8) / (measureElapsed * 1_000_000) : 0;
    } else {
      const elapsed = (performance.now() - startTime) / 1000;
      currentMbps = elapsed > 0 ? (totalBytes * 8) / (elapsed * 1_000_000) : 0;
    }
    const progress = Math.min(((performance.now() - startTime) / TEST_DURATION) * 100, 100);
    onProgress(currentMbps, progress);
    useStore.getState().addSpeedGraphPoint(currentMbps, 'download');
  }, 250);

  await Promise.allSettled(workers);
  clearInterval(progressInterval);

  if (warmupDone && measureStart > 0) {
    const measureElapsed = (performance.now() - measureStart) / 1000;
    return (measureBytes * 8) / (measureElapsed * 1_000_000);
  }
  const totalElapsed = (performance.now() - startTime) / 1000;
  return (totalBytes * 8) / (totalElapsed * 1_000_000);
}

// === UPLOAD ===
async function measureUpload(
  onProgress: (mbps: number, progress: number) => void,
  signal: AbortSignal,
): Promise<number> {
  const { CF_UP } = getEndpoints();
  const PARALLEL = 3;
  const TEST_DURATION = 10000;
  const startTime = performance.now();

  let chunkSize = 256 * 1024; // Start small, adapt up
  let totalBytes = 0;
  let measureBytes = 0;
  let measureStart = 0;
  let warmupDone = false;
  let chunkCount = 0;

  async function uploadWorker(id: number) {
    while (performance.now() - startTime < TEST_DURATION && !signal.aborted) {
      try {
        const payload = new ArrayBuffer(chunkSize);
        const blob = new Blob([payload]);
        await fetch(
          `${CF_UP}?cachebust=${Date.now()}-${id}-${Math.random()}`,
          { method: 'POST', body: blob, signal, cache: 'no-store' },
        );
        totalBytes += chunkSize;
        chunkCount++;

        if (chunkCount > 2 && !warmupDone) {
          warmupDone = true;
          measureStart = performance.now();
        }
        if (warmupDone) measureBytes += chunkSize;

        // Adaptive chunk sizing
        const elapsed = (performance.now() - startTime) / 1000;
        const instantMbps = elapsed > 0 ? (totalBytes * 8) / (elapsed * 1_000_000) : 0;
        if (instantMbps > 30 && chunkSize < 2 * 1024 * 1024) chunkSize = Math.min(chunkSize * 2, 2 * 1024 * 1024);
        else if (instantMbps < 2 && chunkSize > 128 * 1024) chunkSize = Math.max(128 * 1024, chunkSize / 2);
      } catch {
        try {
          const smallBlob = new Blob([new ArrayBuffer(128 * 1024)]);
          await fetch(
            `${CF_UP}?cachebust=${Date.now()}-${id}-fb`,
            { method: 'POST', body: smallBlob, signal, cache: 'no-store' },
          );
          totalBytes += 128 * 1024;
          if (warmupDone) measureBytes += 128 * 1024;
          chunkSize = 128 * 1024;
        } catch { /* skip */ }
      }
    }
  }

  const workers: Promise<void>[] = [];
  for (let i = 0; i < PARALLEL; i++) workers.push(uploadWorker(i));

  const progressInterval = setInterval(() => {
    let currentMbps: number;
    if (warmupDone && measureStart > 0) {
      const measureElapsed = (performance.now() - measureStart) / 1000;
      currentMbps = measureElapsed > 0 ? (measureBytes * 8) / (measureElapsed * 1_000_000) : 0;
    } else {
      const elapsed = (performance.now() - startTime) / 1000;
      currentMbps = elapsed > 0 ? (totalBytes * 8) / (elapsed * 1_000_000) : 0;
    }
    const progress = Math.min(((performance.now() - startTime) / TEST_DURATION) * 100, 100);
    onProgress(currentMbps, progress);
    useStore.getState().addSpeedGraphPoint(currentMbps, 'upload');
  }, 250);

  await Promise.allSettled(workers);
  clearInterval(progressInterval);

  if (warmupDone && measureStart > 0) {
    const measureElapsed = (performance.now() - measureStart) / 1000;
    return (measureBytes * 8) / (measureElapsed * 1_000_000);
  }
  const totalElapsed = (performance.now() - startTime) / 1000;
  return (totalBytes * 8) / (totalElapsed * 1_000_000);
}

// === PING ===
async function measurePing(
  signal: AbortSignal,
): Promise<{ ping: number; jitter: number; packetLoss: number }> {
  const { CF_DOWN } = getEndpoints();
  const pings: number[] = [];
  const totalRequests = 20;
  let failed = 0;

  for (let i = 0; i < totalRequests && !signal.aborted; i++) {
    const start = performance.now();
    try {
      await fetch(`${CF_DOWN}?bytes=1&cachebust=${Date.now()}-p${i}`, {
        signal, cache: 'no-store',
      });
      pings.push(performance.now() - start);
    } catch {
      try {
        const fbStart = performance.now();
        await fetch(`/favicon.svg?cachebust=${Date.now()}-p${i}`, { signal, cache: 'no-store' });
        pings.push(performance.now() - fbStart);
      } catch {
        failed++;
      }
    }
  }

  if (pings.length === 0) return { ping: 999, jitter: 999, packetLoss: 100 };

  pings.sort((a, b) => a - b);
  const median = pings[Math.floor(pings.length / 2)];

  let jitterSum = 0;
  for (let i = 1; i < pings.length; i++) {
    jitterSum += Math.abs(pings[i] - pings[i - 1]);
  }
  const jitter = pings.length > 1 ? jitterSum / (pings.length - 1) : 0;
  const packetLoss = (failed / totalRequests) * 100;

  return { ping: median, jitter, packetLoss };
}

// === BUFFERBLOAT ===
async function measureBufferbloat(
  idlePing: number,
  signal: AbortSignal,
): Promise<number> {
  const { CF_DOWN } = getEndpoints();
  const loadPings: number[] = [];

  // Create sustained background load (3 large downloads)
  const loadPromises: Promise<void>[] = [];
  for (let i = 0; i < 3; i++) {
    loadPromises.push(
      fetch(`${CF_DOWN}?bytes=${4 * 1024 * 1024}&cachebust=bb-${Date.now()}-${i}`, {
        signal, cache: 'no-store',
      })
        .then((r) => r.arrayBuffer())
        .then(() => {}),
    );
  }

  // Measure ping under load
  for (let i = 0; i < 5 && !signal.aborted; i++) {
    const start = performance.now();
    try {
      await fetch(`${CF_DOWN}?bytes=1&cachebust=bbp-${Date.now()}-${i}`, {
        signal, cache: 'no-store',
      });
      loadPings.push(performance.now() - start);
    } catch { /* skip */ }
  }

  await Promise.allSettled(loadPromises);

  if (loadPings.length === 0) return 0;
  const avgLoadPing = loadPings.reduce((a, b) => a + b, 0) / loadPings.length;
  return Math.max(0, avgLoadPing - idlePing);
}

// === DNS MEASUREMENT ===
// Measures DNS+connection resolution time using tiny Cloudflare requests.
// Since we can't isolate pure DNS from cross-origin fetches, we measure
// the total time for a 1-byte fetch (which is dominated by DNS + TCP + TLS).
async function measureDNS(signal: AbortSignal): Promise<number> {
  const { CF_DOWN } = getEndpoints();
  const times: number[] = [];

  for (let i = 0; i < 3 && !signal.aborted; i++) {
    const start = performance.now();
    try {
      await fetch(`${CF_DOWN}?bytes=1&cachebust=dns-${Date.now()}-${i}`, {
        signal, cache: 'no-store', mode: 'cors',
      });
      times.push(performance.now() - start);
    } catch { /* skip */ }
  }

  if (times.length === 0) return 0;
  // Return median for stability
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)];
}

// === MAIN TEST RUNNER ===
export async function runSpeedTest(): Promise<TestResult | null> {
  const store = useStore.getState();

  if (abortController) abortController.abort();
  abortController = new AbortController();
  const signal = abortController.signal;

  try {
    // Phase 1: Ping
    store.setPhase('ping');
    store.setProgress(0);
    store.clearSpeedGraph();

    const { ping, jitter, packetLoss } = await measurePing(signal);
    store.setCurrentPing(ping);
    store.setCurrentJitter(jitter);
    store.setCurrentPacketLoss(packetLoss);
    store.setProgress(10);

    if (signal.aborted) return null;

    // Phase 1.5: DNS
    store.setPhase('dns');
    const dnsSpeed = await measureDNS(signal);
    store.setCurrentDns(dnsSpeed);
    store.setProgress(15);

    if (signal.aborted) return null;

    // Phase 2: Download (multi-connection)
    store.setPhase('download');
    const download = await measureDownload((speed, p) => {
      store.setCurrentDownload(speed);
      store.setProgress(15 + p * 0.45);
    }, signal);
    store.setCurrentDownload(download);

    if (signal.aborted) return null;

    // Phase 3: Upload (multi-connection)
    store.setPhase('upload');
    const upload = await measureUpload((speed, p) => {
      store.setCurrentUpload(speed);
      store.setProgress(60 + p * 0.25);
    }, signal);
    store.setCurrentUpload(upload);

    if (signal.aborted) return null;

    // Phase 4: Bufferbloat
    store.setPhase('bufferbloat');
    store.setProgress(85);
    const bufferbloat = await measureBufferbloat(ping, signal);
    store.setCurrentBufferbloat(bufferbloat);
    store.setProgress(100);

    if (signal.aborted) return null;

    // Detect connection type and ISP
    const connectionType = getConnectionType();
    store.setConnectionType(connectionType);

    let ispName = 'Unknown';
    try {
      const ispInfo = await detectISP();
      ispName = ispInfo.isp;
      store.setIspName(ispName);
    } catch { /* ignore */ }

    const grade = getGrade({ download, upload, ping, jitter, packetLoss, bufferbloat });
    const qualityScore = computeQualityScore({ download, upload, ping, jitter, packetLoss, bufferbloat });
    const { serverName } = getEndpoints();

    const result: TestResult = {
      id: generateId(),
      timestamp: Date.now(),
      download: Math.round(download * 100) / 100,
      upload: Math.round(upload * 100) / 100,
      ping: Math.round(ping * 100) / 100,
      jitter: Math.round(jitter * 100) / 100,
      packetLoss: Math.round(packetLoss * 100) / 100,
      bufferbloat: Math.round(bufferbloat * 100) / 100,
      connectionType,
      isp: ispName,
      grade,
      qualityScore,
      dnsSpeed: Math.round(dnsSpeed * 100) / 100,
      serverLocation: serverName,
    };

    store.setLatestResult(result);
    store.setPhase('complete');
    await store.addToHistory(result);

    return result;
  } catch (err) {
    if ((err as Error).name === 'AbortError') return null;
    console.error('Speed test error:', err);
    store.setPhase('idle');
    return null;
  }
}

export function stopSpeedTest(): void {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  useStore.getState().resetTest();
}
