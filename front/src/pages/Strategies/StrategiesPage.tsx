import { Link } from 'react-router-dom';
import { Radar, ChevronRight } from 'lucide-react';
import { strategies } from '../../services/mockData';
import { strategyIconMap } from '../../config/constants';

export function StrategiesPage() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-300 mb-6 flex items-center gap-2">
        <Radar className="w-5 h-5 text-emerald-500" />
        我的量化策略库
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((s) => (
          <Link
            key={s.id}
            to={`/strategy/${s.id}`}
            className="bg-[#161a1e] p-6 rounded-2xl border border-gray-800 hover:border-emerald-500/50 transition-all group block"
          >
            <div className="flex justify-between mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                {strategyIconMap[s.icon]}
              </div>
              <span className="text-[10px] text-emerald-500 px-2 py-1 bg-emerald-500/10 rounded-full animate-pulse border border-emerald-500/20">
                {s.status}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">{s.name}</h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">{s.desc}</p>
            <div className="border-t border-gray-800 pt-4 flex justify-between items-center text-xs text-blue-400 font-medium">
              <span>符合条件：{s.count} 支标的</span>
              <span className="flex items-center">查看结果 <ChevronRight className="w-4 h-4" /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
