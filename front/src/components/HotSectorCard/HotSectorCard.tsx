import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import type { HotSectorBrief } from '../../services/api';

function getHeatColor(heat: number) {
  if (heat >= 90) return { text: 'text-red-400',     bg: 'bg-red-500/10',     bar: 'bg-red-500',     border: 'border-red-500/30'     };
  if (heat >= 75) return { text: 'text-orange-400',  bg: 'bg-orange-500/10',  bar: 'bg-orange-500',  border: 'border-orange-500/30'  };
  if (heat >= 60) return { text: 'text-yellow-400',  bg: 'bg-yellow-500/10',  bar: 'bg-yellow-500',  border: 'border-yellow-500/30'  };
  return             { text: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', border: 'border-emerald-500/30' };
}

export function HotSectorCard({ sector }: { sector: HotSectorBrief }) {
  const c = getHeatColor(sector.heat_index);

  return (
    <Link
      to={`/sector/${sector.id}`}
      className="p-5 rounded-2xl block group transition-all duration-300 hover:-translate-y-1 bg-[#161a1e] border border-gray-800 hover:border-blue-500/50"
    >
      {/* 标题 + 热度徽章 */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-white">{sector.sector_name}</h3>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${c.bg} border ${c.border}`}>
          <Flame className={`w-3.5 h-3.5 ${c.text}`} />
          <span className={`text-sm font-bold font-mono ${c.text}`}>{sector.heat_index}</span>
        </div>
      </div>

      {/* 热度进度条 */}
      <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden mb-3">
        <div className={`${c.bar} h-full`} style={{ width: `${sector.heat_index}%` }} />
      </div>

      {/* 叙事摘要 */}
      <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">{sector.narrative}</p>

      {/* 催化剂标签 */}
      <div className="flex flex-wrap gap-1.5">
        {sector.catalysts.slice(0, 2).map((tag, i) => (
          <span key={i} className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
        {sector.catalysts.length > 2 && (
          <span className="text-[10px] text-gray-600 self-center">+{sector.catalysts.length - 2}</span>
        )}
      </div>
    </Link>
  );
}
