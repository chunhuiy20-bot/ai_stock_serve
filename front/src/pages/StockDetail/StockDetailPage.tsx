import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, History, Network, Ghost } from 'lucide-react';
import {
  watchlistStocks, strategyResults, sectorChains,
  stockNews, aiHistory, narrativeTags,
} from '../../services/mockData';
import { StrategySelectModal } from '../../components/StrategySelectModal/StrategySelectModal';
import { StockCandleChart, generateMockCandles } from '../../components/StockCandleChart/StockCandleChart';

const narrativeColorMap: Record<string, { text: string; bg: string; bar: string }> = {
  blue:    { text: 'text-blue-400',    bg: 'bg-blue-500/5',    bar: 'bg-blue-500'    },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/5', bar: 'bg-emerald-500' },
  purple:  { text: 'text-purple-400',  bg: 'bg-purple-500/5',  bar: 'bg-purple-500'  },
  red:     { text: 'text-red-400',     bg: 'bg-red-500/5',     bar: 'bg-red-500'     },
};

export function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();

  const [aiOn, setAiOn] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [pnl, setPnl] = useState(0);
  const pnlInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // clean up on unmount or when AI turns off
  useEffect(() => {
    return () => { if (pnlInterval.current) clearInterval(pnlInterval.current); };
  }, []);

  const startShadow = () => {
    setPnl(0);
    pnlInterval.current = setInterval(() => {
      setPnl((prev) => prev + (Math.random() - 0.45) * 2);
    }, 2000);
  };

  const stopShadow = () => {
    if (pnlInterval.current) clearInterval(pnlInterval.current);
    setPnl(0);
    setAiOn(false);
  };

  const allStocks = [
    ...watchlistStocks,
    ...strategyResults,
    ...Object.values(sectorChains).flatMap((c) => [...c.upstream, ...c.midstream, ...c.downstream]),
  ];
  const stock = allStocks.find((s) => s.symbol === symbol);

  const todayCandle = useMemo(() => {
    const candles = generateMockCandles(symbol ?? '');
    return candles[candles.length - 1];
  }, [symbol]);

  return (
    <section className="space-y-6">
      {/* 顶部标题栏 */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-[#161a1e] border border-gray-800 rounded-full text-gray-400 hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-4xl font-bold text-white tracking-tighter uppercase">{symbol}</h2>
            {stock && 'name' in stock && <p className="text-gray-500 text-sm">{stock.name}</p>}
          </div>
          {stock && (
            <span className={`font-mono font-bold px-3 py-1.5 rounded text-sm ${stock.positive ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
              {stock.change}
            </span>
          )}
          <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/20 px-4 py-2 rounded-2xl">
            <span className="text-sm font-medium text-blue-400 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" />
              AI 监控
            </span>
            <button
              onClick={() => { if (!aiOn) setShowStrategyModal(true); else stopShadow(); }}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${aiOn ? 'bg-blue-500' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${aiOn ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 行情数据栏 */}
      {todayCandle && (
        <div className="bg-[#161a1e] border border-gray-800 rounded-2xl px-6 py-4 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-4">
          {[
            { label: '今开', value: todayCandle.open.toFixed(2), color: '' },
            { label: '最高', value: todayCandle.high.toFixed(2), color: 'text-emerald-400' },
            { label: '最低', value: todayCandle.low.toFixed(2),  color: 'text-red-400' },
            { label: '收盘', value: todayCandle.close.toFixed(2),
              color: todayCandle.close >= todayCandle.open ? 'text-emerald-400' : 'text-red-400' },
            { label: '成交量', value: `${(todayCandle.volume / 1_000_000).toFixed(2)}M`, color: '' },
            { label: '振幅',
              value: `${(((todayCandle.high - todayCandle.low) / todayCandle.open) * 100).toFixed(2)}%`,
              color: '' },
            { label: '涨跌幅',
              value: `${todayCandle.close >= todayCandle.open ? '+' : ''}${(((todayCandle.close - todayCandle.open) / todayCandle.open) * 100).toFixed(2)}%`,
              color: todayCandle.close >= todayCandle.open ? 'text-emerald-400' : 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest">{label}</p>
              <p className={`font-mono text-sm font-semibold ${color || 'text-gray-200'}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">

          {/* 宏观叙事关联图谱 */}
          <div className="bg-[#161a1e] p-5 rounded-2xl border border-gray-800">
            <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
              <Network className="w-4 h-4" />
              宏观叙事关联图谱 (Narrative Map)
            </h3>
            <div className="flex flex-wrap gap-3">
              {narrativeTags.map((tag) => {
                const c = narrativeColorMap[tag.color];
                return (
                  <div
                    key={tag.label}
                    className={`px-3 py-2 rounded-xl ${c.bg} flex items-center gap-2 cursor-help border border-transparent hover:border-blue-500/50 transition-all`}
                  >
                    <span className={`text-xs font-bold ${c.text}`}>{tag.label}</span>
                    <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`${c.bar} h-full transition-all`} style={{ width: `${tag.pct}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500">{tag.pct}% 关联度</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* K线图 */}
          <StockCandleChart symbol={symbol ?? ''} />

          {/* AI 历史研判 */}
          <div className="bg-[#161a1e] p-6 rounded-2xl border border-gray-800">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-white">
              <History className="w-5 h-5 text-blue-500" />
              AI 历史研判
            </h3>
            <div className="border-l-2 border-gray-800 ml-2 pl-6 py-2 space-y-6">
              {aiHistory.map((item, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[31px] top-1 w-2 h-2 rounded-full ${item.type === 'bullish' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold text-sm ${item.type === 'bullish' ? 'text-emerald-400' : 'text-gray-400'}`}>{item.label}</span>
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧边栏 */}
        <div className="lg:col-span-1 space-y-6">

          {/* 影子交易仓 */}
          <div className={`bg-[#161a1e] p-6 rounded-2xl border border-gray-800 transition-all duration-500 ${aiOn ? 'ai-active-glow' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-200 flex items-center gap-2">
                <Ghost className="w-4 h-4 text-purple-500" />
                影子交易仓
              </h3>
              {aiOn ? (
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded animate-pulse font-bold">
                  影子交易运行中
                </span>
              ) : (
                <span className="text-[10px] bg-gray-800 text-gray-500 px-2 py-1 rounded">未运行</span>
              )}
            </div>

            <div className={`space-y-6 transition-opacity duration-500 ${aiOn ? 'opacity-100' : 'opacity-40'}`}>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">模拟盈亏 (Shadow PnL)</p>
                <p className={`text-3xl font-mono font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                   style={pnl > 0 ? { textShadow: '0 0 10px rgba(16,185,129,0.3)' } : undefined}>
                  {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-3 rounded-xl">
                  <p className="text-[10px] text-gray-500 mb-1">入场价</p>
                  <p className="font-mono text-sm">{aiOn && stock ? stock.price : '--.--'}</p>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-xl">
                  <p className="text-[10px] text-gray-500 mb-1">持仓时间</p>
                  <ShadowTimer running={aiOn} />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-800">
                <p className="text-[10px] text-gray-500 mb-2">当前策略执行强度</p>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-1000"
                    style={{ width: aiOn ? '75%' : '0%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 个股动态 */}
          <div className="bg-[#161a1e] p-5 rounded-2xl border border-gray-800">
            <h3 className="font-bold border-b border-gray-800 pb-3 mb-4">个股动态</h3>
            <div className="space-y-4">
              {stockNews.map((news, i) => (
                <div key={i} className="group cursor-pointer">
                  <p className="text-sm font-medium group-hover:text-blue-400 transition text-gray-200">{news.title}</p>
                  <span className="text-[10px] text-gray-500">{news.time} · {news.source}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showStrategyModal && (
        <StrategySelectModal
          onConfirm={() => {
            setShowStrategyModal(false);
            setAiOn(true);
            startShadow();
          }}
          onClose={() => setShowStrategyModal(false)}
        />
      )}
    </section>
  );
}

// 持仓计时器
function ShadowTimer({ running }: { running: boolean }) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (!running) { setSecs(0); return; }
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return <p className="font-mono text-sm">{m}m {s.toString().padStart(2, '0')}s</p>;

}
