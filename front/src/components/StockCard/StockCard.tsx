import { Link } from 'react-router-dom';
import type { WatchlistStock } from '../../services/api';

export function StockCard({ stock }: { stock: WatchlistStock }) {
  const changePercent = stock.change_percent ?? 0;
  const positive = changePercent >= 0;
  const changeStr = `${positive ? '+' : ''}${changePercent.toFixed(2)}%`;

  return (
    <Link
      to={`/stock/${stock.symbol}`}
      className="bg-[#161a1e] p-6 rounded-2xl border border-gray-800 hover:border-blue-500/50 hover:bg-[#1e2329] shadow-lg transition-all group block"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold group-hover:text-blue-400 transition-colors">{stock.name}</h3>
          <p className="text-gray-500 text-xs uppercase italic tracking-widest">{stock.symbol}</p>
        </div>
        <span className={`font-mono font-bold px-2 py-1 rounded text-sm ${positive ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
          {changeStr}
        </span>
      </div>
      <div className="text-3xl font-mono font-semibold">{(stock.price ?? 0).toFixed(2)}</div>
    </Link>
  );
}
