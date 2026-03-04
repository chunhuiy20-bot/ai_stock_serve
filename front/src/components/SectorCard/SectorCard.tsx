import { Link } from 'react-router-dom';
import { Pin } from 'lucide-react';
import { sectorIconMap } from '../../config/constants';
import { hotSectors } from '../../services/mockData';

type Sector = typeof hotSectors[0];

export function SectorCard({ sector }: { sector: Sector }) {
  return (
    <Link
      to={`/sector/${sector.id}`}
      className="p-5 rounded-2xl block relative group transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'linear-gradient(145deg, rgba(31,41,55,0.6), rgba(17,24,39,0.8))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(75,85,99,0.3)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(75,85,99,0.3)')}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
          {sectorIconMap[sector.icon]}
        </div>
        <Pin className="w-4 h-4 fill-blue-500 text-blue-500" />
      </div>
      <h3 className="font-bold text-lg text-white">{sector.name}</h3>
      <div className="flex justify-between items-end mt-2">
        <p className="text-[10px] text-gray-500 tracking-tighter">产业链深度分析</p>
        <span className={`font-mono font-bold text-lg ${sector.positive ? 'text-emerald-400' : 'text-red-400'}`}>
          {sector.change}
        </span>
      </div>
    </Link>
  );
}
