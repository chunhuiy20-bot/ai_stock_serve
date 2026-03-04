import { Link } from 'react-router-dom';
import type { SectorKeyStock } from '../../services/api';

interface ChainColumnProps {
  title: string;
  color: string;
  description: string;
  stocks: SectorKeyStock[];
}

export function ChainColumn({ title, color, description, stocks }: ChainColumnProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
        <span className={`w-2 h-5 ${color} rounded-full`} />
        <h3 className="font-bold">{title}</h3>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      {stocks.map((s) => (
        <div key={s.symbol} className="bg-[#161a1e] p-5 rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all group">
          <div className="mb-3">
            <Link to={`/stock/${s.symbol}`} className="block">
              <h3 className="text-xl font-bold group-hover:text-blue-400 transition">{s.name}</h3>
              <p className="text-[10px] text-gray-500 uppercase">{s.symbol}</p>
            </Link>
          </div>
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">{s.reason}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-800 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${s.momentum_score}%` }} />
            </div>
            <span className="text-xs font-mono text-blue-400 w-6 text-right">{s.momentum_score}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

