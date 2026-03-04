import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { aiStrategies } from '../../config/constants';

interface StrategySelectModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export function StrategySelectModal({ onConfirm, onClose }: StrategySelectModalProps) {
  const [selected, setSelected] = useState('rsi');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div className="bg-[#1c2127] border border-gray-700 w-full max-w-lg rounded-3xl shadow-2xl relative z-10 p-6">
        <h3 className="text-xl font-bold mb-1 flex items-center gap-2 text-white">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          配置 AI 监控策略
        </h3>
        <p className="text-xs text-gray-500 mb-6">选择一个策略实时监听该个股的市场信号</p>
        <div className="space-y-3 mb-6">
          {aiStrategies.map((s) => (
            <label
              key={s.value}
              className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                selected === s.value
                  ? 'border-blue-500/50 bg-blue-500/5'
                  : 'border-gray-800 hover:border-blue-500/30 hover:bg-blue-500/5'
              }`}
            >
              <div className="flex items-center gap-4">
                {s.icon}
                <div>
                  <div className="text-sm font-bold text-white">{s.label}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{s.desc}</div>
                </div>
              </div>
              <input
                type="radio"
                name="strategy_choice"
                value={s.value}
                checked={selected === s.value}
                onChange={() => setSelected(s.value)}
                className="w-4 h-4 accent-blue-500"
              />
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm transition">
            取消
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition">
            启动监控
          </button>
        </div>
      </div>
    </div>
  );
}
