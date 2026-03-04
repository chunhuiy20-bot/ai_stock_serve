import { useState, useEffect } from 'react';
import { Star, Layers } from 'lucide-react';
import { StockCard } from '../../components/StockCard/StockCard';
import { HotSectorCard } from '../../components/HotSectorCard/HotSectorCard';
import { useWatchlist } from '../../store/watchlistStore';
import { fetchTodayHotSectors, type HotSectorBrief } from '../../services/api';

export function WatchlistPage() {
  const { watchlist, loading: watchlistLoading } = useWatchlist();
  const [hotSectors, setHotSectors] = useState<HotSectorBrief[]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(true);

  useEffect(() => {
    fetchTodayHotSectors()
      .then(setHotSectors)
      .catch(console.error)
      .finally(() => setSectorsLoading(false));
  }, []);

  return (
    <section className="space-y-12">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-6">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          我的自选股
        </h2>
        {watchlistLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-[#161a1e] p-6 rounded-2xl border border-gray-800 animate-pulse space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-7 w-28 bg-gray-800 rounded-lg" />
                    <div className="h-3 w-20 bg-gray-800 rounded" />
                  </div>
                  <div className="h-6 w-14 bg-gray-800 rounded" />
                </div>
                <div className="h-8 w-32 bg-gray-800 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((s) => <StockCard key={s.id} stock={s} />)}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-500" />
          今日热门板块
        </h2>
        {sectorsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#161a1e] border border-gray-800 animate-pulse space-y-3">
                <div className="flex justify-between items-start">
                  <div className="h-5 w-24 bg-gray-800 rounded-lg" />
                  <div className="h-6 w-14 bg-gray-800 rounded-lg" />
                </div>
                <div className="h-1 w-full bg-gray-800 rounded-full" />
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-gray-800 rounded" />
                  <div className="h-3 w-4/5 bg-gray-800 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-4 w-20 bg-gray-800 rounded-full" />
                  <div className="h-4 w-16 bg-gray-800 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotSectors.map((sector) => <HotSectorCard key={sector.id} sector={sector} />)}
          </div>
        )}
      </div>
    </section>
  );
}
