import { useState, useEffect, useRef, useMemo } from 'react';
import { CandlestickChart } from 'lucide-react';

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type Period = '1W' | '1M' | '3M' | '6M' | '1Y';
const PERIOD_DAYS: Record<Period, number> = { '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 250 };

export function generateMockCandles(symbol: string): CandleData[] {
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  let price = 50 + (seed % 250);
  const data: CandleData[] = [];
  const base = new Date('2026-03-02');

  for (let i = 280; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const vol = price * 0.022;
    const open = price;
    const close = Math.max(0.1, open + (Math.random() - 0.48) * vol);
    const wick = vol * Math.random() * 0.6;
    const high = Math.max(open, close) + wick;
    const low = Math.max(0.01, Math.min(open, close) - wick * Math.random());
    const volume = Math.floor((0.3 + Math.random() * 0.8) * 8_000_000);

    data.push({
      date: d.toISOString().slice(0, 10),
      open: +open.toFixed(2),
      close: +close.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      volume,
    });
    price = close;
  }
  return data;
}

interface TooltipState {
  x: number;
  y: number;
  candle: CandleData;
}

const PAD = { top: 16, right: 16, bottom: 32, left: 60 };
const HEIGHT = 320;
const VOL_H = 44;
const GAP = 8;
const PRICE_H = HEIGHT - PAD.top - PAD.bottom - VOL_H - GAP;

export function StockCandleChart({ symbol }: { symbol: string }) {
  const [period, setPeriod] = useState<Period>('3M');
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [svgWidth, setSvgWidth] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setSvgWidth(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const allData = useMemo(() => generateMockCandles(symbol), [symbol]);
  const data = useMemo(() => allData.slice(-PERIOD_DAYS[period]), [allData, period]);

  const chartW = svgWidth - PAD.left - PAD.right;
  const barStep = chartW / data.length;
  const barW = Math.max(1.5, barStep * 0.65);
  const cx = (i: number) => PAD.left + i * barStep + barStep / 2;

  // price scale
  const pMin = Math.min(...data.map((d) => d.low));
  const pMax = Math.max(...data.map((d) => d.high));
  const pPad = (pMax - pMin) * 0.06;
  const scaleMin = pMin - pPad;
  const scaleMax = pMax + pPad;
  const py = (p: number) =>
    PAD.top + PRICE_H - ((p - scaleMin) / (scaleMax - scaleMin)) * PRICE_H;

  // volume scale
  const maxVol = Math.max(...data.map((d) => d.volume));
  const volY = (v: number) =>
    PAD.top + PRICE_H + GAP + VOL_H - (v / maxVol) * VOL_H;
  const volBase = PAD.top + PRICE_H + GAP + VOL_H;

  // y-axis ticks
  const yTicks = Array.from({ length: 5 }, (_, i) =>
    scaleMin + ((scaleMax - scaleMin) / 4) * i
  );

  // x-axis ticks (~6 labels)
  const xTickCount = Math.min(6, data.length);
  const xTicks = Array.from({ length: xTickCount }, (_, i) => {
    const idx = Math.round((i / (xTickCount - 1)) * (data.length - 1));
    return { idx, label: data[idx].date.slice(5) };
  });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const idx = Math.round((mx - PAD.left) / barStep - 0.5);
    if (idx < 0 || idx >= data.length) { setTooltip(null); return; }
    setTooltip({ x: cx(idx), y: e.clientY - rect.top, candle: data[idx] });
  };

  return (
    <div className="bg-[#161a1e] rounded-2xl border border-gray-800 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2">
          <CandlestickChart className="w-4 h-4" />
          K线图
          <span className="text-[10px] text-gray-600 font-normal">Mock 数据</span>
        </h3>
        <div className="flex gap-1">
          {(['1W', '1M', '3M', '6M', '1Y'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                period === p
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="w-full relative" style={{ height: HEIGHT }}>
        <svg
          width="100%"
          height={HEIGHT}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
          className="cursor-crosshair"
        >
          {/* grid lines + y labels */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line
                x1={PAD.left} y1={py(v)}
                x2={PAD.left + chartW} y2={py(v)}
                stroke="#1f2937" strokeWidth={1}
              />
              <text
                x={PAD.left - 6} y={py(v)}
                textAnchor="end" dominantBaseline="middle"
                fill="#4b5563" fontSize={10}
              >
                {v.toFixed(1)}
              </text>
            </g>
          ))}

          {/* x labels */}
          {xTicks.map(({ idx, label }) => (
            <text
              key={idx}
              x={cx(idx)} y={HEIGHT - 6}
              textAnchor="middle" fill="#4b5563" fontSize={10}
            >
              {label}
            </text>
          ))}

          {/* VOL label */}
          <text
            x={PAD.left - 6} y={PAD.top + PRICE_H + GAP + VOL_H / 2}
            textAnchor="end" dominantBaseline="middle"
            fill="#374151" fontSize={9}
          >
            VOL
          </text>

          {/* candles */}
          {data.map((d, i) => {
            const up = d.close >= d.open;
            const color = up ? '#10b981' : '#ef4444';
            const bodyTop = py(Math.max(d.open, d.close));
            const bodyH = Math.max(1, py(Math.min(d.open, d.close)) - bodyTop);
            const x = cx(i);
            return (
              <g key={i}>
                <line x1={x} y1={py(d.high)} x2={x} y2={py(d.low)} stroke={color} strokeWidth={1} />
                <rect
                  x={x - barW / 2} y={bodyTop}
                  width={barW} height={bodyH}
                  fill={up ? color : color}
                  fillOpacity={up ? 0.85 : 1}
                />
              </g>
            );
          })}

          {/* volume bars */}
          {data.map((d, i) => {
            const up = d.close >= d.open;
            const yTop = volY(d.volume);
            return (
              <rect
                key={i}
                x={cx(i) - barW / 2} y={yTop}
                width={barW} height={Math.max(1, volBase - yTop)}
                fill={up ? '#10b981' : '#ef4444'} fillOpacity={0.25}
              />
            );
          })}

          {/* crosshair */}
          {tooltip && (
            <line
              x1={tooltip.x} y1={PAD.top}
              x2={tooltip.x} y2={PAD.top + PRICE_H}
              stroke="#374151" strokeWidth={1} strokeDasharray="3 3"
            />
          )}
        </svg>

        {/* tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-10 bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs space-y-1 shadow-xl"
            style={{
              left: tooltip.x + 12 > svgWidth - 140 ? tooltip.x - 148 : tooltip.x + 12,
              top: Math.max(8, tooltip.y - 60),
            }}
          >
            <p className="text-gray-400 font-bold mb-1">{tooltip.candle.date}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <span className="text-gray-500">开</span><span className="font-mono text-gray-200">{tooltip.candle.open}</span>
              <span className="text-gray-500">高</span><span className="font-mono text-emerald-400">{tooltip.candle.high}</span>
              <span className="text-gray-500">低</span><span className="font-mono text-red-400">{tooltip.candle.low}</span>
              <span className="text-gray-500">收</span><span className={`font-mono ${tooltip.candle.close >= tooltip.candle.open ? 'text-emerald-400' : 'text-red-400'}`}>{tooltip.candle.close}</span>
              <span className="text-gray-500">量</span><span className="font-mono text-gray-400">{(tooltip.candle.volume / 1_000_000).toFixed(1)}M</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
