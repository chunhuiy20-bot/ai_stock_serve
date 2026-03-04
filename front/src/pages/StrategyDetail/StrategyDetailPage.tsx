import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { strategies, strategyResults } from '../../services/mockData';

export function StrategyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const strategy = strategies.find((s) => s.id === id);

  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/strategies" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold">策略结果: {strategy?.name ?? id}</h2>
          <p className="text-gray-500 text-sm mt-0.5">{strategy?.desc}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {strategyResults.map((stock) => (
          <Link
            key={stock.symbol}
            to={`/stock/${stock.symbol}`}
            className="bg-[#161a1e] border border-gray-800 p-5 rounded-xl hover:border-blue-500 transition-all block group"
          >
            <div className="flex justify-between mb-2">
              <span className="font-bold text-white text-lg group-hover:text-blue-400 transition">{stock.symbol}</span>
              <span className={`text-xs font-mono ${stock.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {stock.change}
              </span>
            </div>
            <div className="text-xl font-mono mb-3 text-white">{stock.price}</div>
            <div className="text-[10px] text-gray-500 flex justify-between">
              <span>匹配度</span>
              <span className="text-blue-400">{stock.match}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
