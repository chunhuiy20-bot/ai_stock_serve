import { useState, useEffect, useRef } from 'react';
import { Sword, Terminal, RefreshCw } from 'lucide-react';
import { AiConfigModal } from './AiConfigModal';

interface ArenaNode {
  id: number;
  label: string;
  name: string;
  strategy: string;
  color: string;       // tailwind color key: blue | purple | orange
  winRate: number;
  drawdown: string;
  position: string;
}

const INITIAL_NODES: ArenaNode[] = [
  { id: 1, label: 'Alpha', name: 'RSI 反转王',  strategy: 'RSI 超卖',  color: 'blue',   winRate: 65, drawdown: '2.1%', position: 'NVDA (12%)' },
  { id: 2, label: 'Beta',  name: '鲸鱼追踪者', strategy: '主力大单',  color: 'purple', winRate: 48, drawdown: '0.5%', position: '空仓'       },
  { id: 3, label: 'Gamma', name: '宏观预言机', strategy: '宏观叙事',  color: 'orange', winRate: 32, drawdown: '4.8%', position: 'TSM (8%)'   },
];

const colorMap: Record<string, { ring: string; bg: string; text: string; bar: string; btn: string }> = {
  blue:   { ring: 'border-blue-500/30',   bg: 'bg-blue-600/20',   text: 'text-blue-500',   bar: 'bg-blue-500',   btn: 'hover:bg-blue-600/20 hover:text-blue-400'   },
  purple: { ring: 'border-purple-500/30', bg: 'bg-purple-600/20', text: 'text-purple-500', bar: 'bg-purple-500', btn: 'hover:bg-purple-600/20 hover:text-purple-400' },
  orange: { ring: 'border-orange-500/30', bg: 'bg-orange-600/20', text: 'text-orange-500', bar: 'bg-orange-500', btn: 'hover:bg-orange-600/20 hover:text-orange-400' },
};

const AI_NAMES = ['Alpha', 'Beta', 'Gamma'];
const LOG_ACTIONS = [
  '执行 RSI 超卖买入',
  '检测到机构流出，减仓',
  '由于叙事共振，加仓',
  '触发止损，清仓',
  '监测到大单异动，建仓',
];

export function ArenaPage() {
  const [pnls, setPnls] = useState([0, 0, 0]);
  const [logs, setLogs] = useState<{ ai: string; msg: string; warn?: boolean }[]>([
    { ai: '系统', msg: '竞技场本金分配完毕，AI 节点启动中...' },
  ]);
  const [configTarget, setConfigTarget] = useState<ArenaNode | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPnls((prev) => prev.map((p) => p + (Math.random() - 0.48) * 0.5));
      if (Math.random() > 0.7) {
        const ai = AI_NAMES[Math.floor(Math.random() * 3)];
        const msg = LOG_ACTIONS[Math.floor(Math.random() * LOG_ACTIONS.length)];
        setLogs((prev) => [{ ai, msg }, ...prev].slice(0, 30));
      }
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const reset = () => {
    setPnls([0, 0, 0]);
    setLogs([{ ai: '系统', msg: '本金已重置，重新初始化...' }]);
  };

  const winner = pnls.indexOf(Math.max(...pnls));

  return (
    <section className="space-y-8">
      {/* 标题栏 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sword className="w-7 h-7 text-red-500" />
            AI 交易竞技场
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            所有 AI 节点分配相同本金 ($100,000)，进行 7×24h 自动博弈。
          </p>
        </div>
        <div className="bg-[#161a1e] px-4 py-2 rounded-xl border border-gray-800 flex items-center gap-4">
          <span className="text-xs text-gray-500">
            模拟频率: <span className="text-blue-400 font-mono">1s/Tick</span>
          </span>
          <button
            onClick={reset}
            className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-white transition flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> 重置本金
          </button>
        </div>
      </div>

      {/* AI 节点卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {INITIAL_NODES.map((node, i) => {
          const c = colorMap[node.color];
          const pnl = pnls[i];
          const isWinning = i === winner && pnl > 0;

          return (
            <div
              key={node.id}
              className={`p-6 rounded-3xl border transition-all duration-500 ${
                isWinning
                  ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-[#0b0e11]'
                  : 'border-gray-800/60 bg-gradient-to-br from-gray-800/40 to-[#0b0e11]/60'
              }`}
              style={{ backdropFilter: 'blur(10px)' }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${c.bg} rounded-full flex items-center justify-center ${c.text} border ${c.ring} text-xs font-bold`}>
                    {node.label}
                  </div>
                  <div>
                    <h4 className="font-bold">{node.name}</h4>
                    <span className="text-[10px] text-gray-500">已选策略: {node.strategy}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase mb-1">收益率</p>
                  <p className={`text-xl font-mono font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">当前持仓</span>
                  <span className={`font-mono font-bold ${c.text}`}>{node.position}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${c.bar} rounded-full transition-all duration-1000`}
                    style={{ width: `${node.winRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>胜率: {node.winRate}%</span>
                  <span>回撤: {node.drawdown}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800/50">
                <button
                  onClick={() => setConfigTarget(node)}
                  className={`w-full py-2 bg-gray-800/50 ${c.btn} rounded-xl text-xs transition`}
                >
                  重新配置策略
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 实况日志 */}
      <div className="bg-[#161a1e] border border-gray-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          竞技场实况日志 (AI Arena Logs)
        </h3>
        <div className="space-y-2 font-mono text-[11px] h-40 overflow-y-auto custom-scrollbar">
          {logs.map((log, i) => (
            <p key={i} className={log.warn ? 'text-orange-400 font-bold' : 'text-gray-400'}>
              <span className={log.warn ? 'text-orange-500' : 'text-blue-500'}>[{log.ai}]</span>{' '}
              {log.msg}
            </p>
          ))}
        </div>
      </div>

      {configTarget && (
        <AiConfigModal
          node={configTarget}
          onClose={() => setConfigTarget(null)}
          onSave={() => { setConfigTarget(null); reset(); }}
        />
      )}
    </section>
  );
}
