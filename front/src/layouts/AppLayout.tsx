import { Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  const isListActive = pathname === '/' || pathname.startsWith('/sector/') || pathname.startsWith('/stock/');
  const isArenaActive = pathname === '/arena';
  const isGameActive = pathname === '/game';
  const isStrategiesActive = pathname === '/strategies' || pathname.startsWith('/strategy/');

  const navLink = (to: string, label: string, active: boolean) => (
    <Link
      to={to}
      className={`h-full flex items-center transition-colors ${
        active ? 'text-blue-400 border-b-2 border-blue-500 translate-y-0.5' : 'hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="bg-[#0b0e11] text-gray-100 min-h-screen font-sans">
      <header className="border-b border-gray-800 bg-[#161a1e] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center gap-10">
          <Link to="/" className="text-xl font-bold text-blue-500 flex items-center gap-2 shrink-0">
            <Zap className="w-5 h-5 fill-blue-500" />
            StockPulse
            <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded ml-1">
              ARENA
            </span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-400 h-16 items-center">
            {navLink('/', '自选看板', isListActive)}
            {navLink('/arena', 'AI 竞技场', isArenaActive)}
            {navLink('/game', '地图指挥台', isGameActive)}
            {navLink('/strategies', '策略中心', isStrategiesActive)}
          </nav>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto p-4 md:p-6 relative">
        {children}
      </main>
    </div>
  );
}
