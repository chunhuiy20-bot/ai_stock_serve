import { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserWatchlist, type WatchlistStock } from '../services/api';

interface WatchlistContextValue {
  watchlist: WatchlistStock[];
  loading: boolean;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserWatchlist()
      .then(setWatchlist)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <WatchlistContext.Provider value={{ watchlist, loading }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used inside WatchlistProvider');
  return ctx;
}
