import type { TestResult } from '../types';
import { formatSpeed, formatPing } from './utils';

/**
 * Export test history as CSV.
 */
export function exportHistoryCSV(results: TestResult[]): void {
  const headers = [
    'Date',
    'Download (Mbps)',
    'Upload (Mbps)',
    'Ping (ms)',
    'Jitter (ms)',
    'Packet Loss (%)',
    'Bufferbloat (ms)',
    'Quality Score',
    'Grade',
    'Connection',
    'ISP',
  ];

  const rows = results.map((r) => [
    new Date(r.timestamp).toISOString(),
    formatSpeed(r.download),
    formatSpeed(r.upload),
    formatPing(r.ping),
    formatPing(r.jitter),
    r.packetLoss.toFixed(1),
    formatPing(r.bufferbloat),
    r.qualityScore?.toString() ?? '',
    r.grade,
    r.connectionType,
    r.isp,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `speedfox-results-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate a shareable result image using Canvas API.
 */
export async function generateShareImage(result: TestResult): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 340;
  const ctx = canvas.getContext('2d')!;

  // Background
  const bg = ctx.createLinearGradient(0, 0, 600, 340);
  bg.addColorStop(0, '#06090f');
  bg.addColorStop(1, '#0c1120');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 600, 340);

  // Border
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, 599, 339);

  // Title
  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 18px Inter, system-ui, sans-serif';
  ctx.fillText('Speedfox', 28, 38);

  ctx.fillStyle = '#4b5972';
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.fillText(`${new Date(result.timestamp).toLocaleString()} · ${result.isp || ''}`, 28, 58);

  // Divider
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
  ctx.beginPath();
  ctx.moveTo(28, 72);
  ctx.lineTo(572, 72);
  ctx.stroke();

  // Quality Score
  const scoreColor = (result.qualityScore ?? 0) >= 70 ? '#06b6d4' : (result.qualityScore ?? 0) >= 50 ? '#f97316' : '#ef4444';
  ctx.fillStyle = scoreColor;
  ctx.font = 'bold 56px Inter, system-ui, sans-serif';
  ctx.fillText(`${result.qualityScore ?? '—'}`, 28, 140);
  ctx.fillStyle = '#4b5972';
  ctx.font = 'bold 14px Inter, system-ui, sans-serif';
  ctx.fillText('/100 Quality Score', 120, 140);

  // Metrics grid
  const metrics = [
    { label: 'Download', value: `${formatSpeed(result.download)} Mbps`, color: '#06b6d4' },
    { label: 'Upload', value: `${formatSpeed(result.upload)} Mbps`, color: '#8b5cf6' },
    { label: 'Ping', value: `${formatPing(result.ping)} ms`, color: '#14b8a6' },
    { label: 'Jitter', value: `${formatPing(result.jitter)} ms`, color: '#f97316' },
    { label: 'Packet Loss', value: `${result.packetLoss.toFixed(1)}%`, color: result.packetLoss > 0 ? '#ef4444' : '#22c55e' },
    { label: 'Bufferbloat', value: `${formatPing(result.bufferbloat)} ms`, color: '#f97316' },
  ];

  metrics.forEach((m, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 28 + col * 190;
    const y = 180 + row * 60;

    ctx.fillStyle = '#4b5972';
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillText(m.label.toUpperCase(), x, y);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 20px Inter, system-ui, sans-serif';
    ctx.fillText(m.value, x, y + 22);
  });

  // Grade badge
  ctx.fillStyle = scoreColor;
  ctx.font = 'bold 13px Inter, system-ui, sans-serif';
  const gradeText = result.grade.toUpperCase();
  const gradeWidth = ctx.measureText(gradeText).width;
  ctx.fillStyle = `${scoreColor}22`;
  ctx.beginPath();
  ctx.roundRect(600 - gradeWidth - 50, 92, gradeWidth + 24, 28, 6);
  ctx.fill();
  ctx.fillStyle = scoreColor;
  ctx.fillText(gradeText, 600 - gradeWidth - 38, 111);

  // Footer
  ctx.fillStyle = '#4b5972';
  ctx.font = '10px Inter, system-ui, sans-serif';
  ctx.fillText('speedfox.app', 28, 326);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

/**
 * Share a test result using the Web Share API or fallback to download.
 */
export async function shareResult(result: TestResult): Promise<void> {
  const blob = await generateShareImage(result);
  const file = new File([blob], 'speedfox-result.png', { type: 'image/png' });

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Speedfox Results',
        text: `Download: ${formatSpeed(result.download)} Mbps | Upload: ${formatSpeed(result.upload)} Mbps | Ping: ${formatPing(result.ping)} ms | Score: ${result.qualityScore ?? '—'}/100`,
        files: [file],
      });
      return;
    } catch {
      // Fall through to download
    }
  }

  // Fallback: download image
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'speedfox-result.png';
  a.click();
  URL.revokeObjectURL(url);
}
