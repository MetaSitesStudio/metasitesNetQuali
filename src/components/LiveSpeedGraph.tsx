import { useStore } from '../store/useStore';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export function LiveSpeedGraph() {
  const data = useStore((s) => s.speedGraphData);
  const phase = useStore((s) => s.phase);

  const isVisible = phase === 'download' || phase === 'upload' || phase === 'bufferbloat' || phase === 'complete';

  if (!isVisible || data.length < 2) return null;

  // Find peak for the Y axis
  const maxSpeed = Math.max(...data.map((d) => d.speed), 1);

  return (
    <div className="panel" style={{ padding: '16px 16px 8px 8px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, paddingLeft: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 3, borderRadius: 2, background: 'var(--accent)' }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Download
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 3, borderRadius: 2, background: 'var(--accent-purple)' }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Upload
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="speedDlGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="speedUlGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-purple)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={false}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, Math.ceil(maxSpeed * 1.15)]}
            tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }}
            axisLine={false}
            tickLine={false}
            width={36}
            tickFormatter={(v: number) => v > 0 ? `${Math.round(v)}` : ''}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 11,
              fontWeight: 600,
              padding: '6px 10px',
            }}
            labelFormatter={(v) => `${v}s`}
            formatter={(value: any, name: any) => [
              `${Number(value).toFixed(1)} Mbps`,
              name === 'download' ? 'Download' : 'Upload',
            ]}
          />
          {/* Render download area */}
          <Area
            type="monotone"
            dataKey={(d: any) => d.type === 'download' ? d.speed : undefined}
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#speedDlGrad)"
            dot={false}
            isAnimationActive={false}
            name="download"
            connectNulls={false}
          />
          {/* Render upload area */}
          <Area
            type="monotone"
            dataKey={(d: any) => d.type === 'upload' ? d.speed : undefined}
            stroke="var(--accent-purple)"
            strokeWidth={2}
            fill="url(#speedUlGrad)"
            dot={false}
            isAnimationActive={false}
            name="upload"
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
