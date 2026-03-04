import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface ArenaNode {
  id: number;
  label: string;
  name: string;
}

const ARENA_STRATEGIES = [
  { value: 'rsi',   label: '激进型：RSI + 动能追踪',  desc: '高频调仓，追求极致回撤下的爆发' },
  { value: 'whale', label: '稳健型：主力筹码监控',     desc: '低频调仓，仅在机构介入时入场'   },
];

export function AiConfigModal({
  node, onClose, onSave,
}: {
  node: ArenaNode;
  onClose: () => void;
  onSave: () => void;
}) {
  const [selected, setSelected] = useState('rsi');

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80"
        style={{ backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      />
      <div className="bg-[#1c2127] border border-gray-700 w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-8">
        <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          配置 AI 节点 {node.label}
        </h3>
        <p className="text-xs text-gray-500 mb-6">{node.name}</p>
        <div className="space-y-4 mb-8">
          {ARENA_STRATEGIES.map((s) => (
            <label
              key={s.value}
              onClick={() => setSelected(s.value)}
              className={`block p-4 border rounded-2xl cursor-pointer transition-all ${
                selected === s.value
                  ? 'border-blue-500/50 bg-blue-600/10'
                  : 'border-gray-800 hover:bg-blue-600/5'
              }`}
            >
              <p className="font-bold text-sm text-white">{s.label}</p>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </label>
          ))}
        </div>
        <button
          onClick={onSave}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition"
        >
          确认并重新初始化
        </button>
      </div>
    </div>
  );
}
