import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { WatchlistProvider } from './store/watchlistStore';
import { WatchlistPage } from './pages/Watchlist/WatchlistPage';
import { StrategiesPage } from './pages/Strategies/StrategiesPage';
import { StrategyDetailPage } from './pages/StrategyDetail/StrategyDetailPage';
import { SectorDetailPage } from './pages/SectorDetail/SectorDetailPage';
import { StockDetailPage } from './pages/StockDetail/StockDetailPage';
import { ArenaPage } from './pages/Arena/ArenaPage';
import { GamePage } from './pages/Game/GamePage';
import './App.css';

export default function App() {
  return (
    <WatchlistProvider>
      <AppLayout>
        <Routes>
          <Route path="/"               element={<WatchlistPage />} />
          <Route path="/arena"          element={<ArenaPage />} />
          <Route path="/game"           element={<GamePage />} />
          <Route path="/strategies"     element={<StrategiesPage />} />
          <Route path="/strategy/:id"   element={<StrategyDetailPage />} />
          <Route path="/sector/:id"     element={<SectorDetailPage />} />
          <Route path="/stock/:symbol"  element={<StockDetailPage />} />
        </Routes>
      </AppLayout>
    </WatchlistProvider>
  );
}
