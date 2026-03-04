import { Cpu, Sun, Fuel, FlaskConical, TrendingDown, GitMerge, BarChart2, Zap } from 'lucide-react';

export const sectorIconMap: Record<string, React.ReactNode> = {
  cpu:             <Cpu className="w-6 h-6" />,
  sun:             <Sun className="w-6 h-6" />,
  fuel:            <Fuel className="w-6 h-6" />,
  'flask-conical': <FlaskConical className="w-6 h-6" />,
};

export const strategyIconMap: Record<string, React.ReactNode> = {
  'trending-down': <TrendingDown className="w-5 h-5" />,
  'git-merge':     <GitMerge className="w-5 h-5" />,
  'bar-chart-2':   <BarChart2 className="w-5 h-5" />,
};

export const aiStrategies = [
  {
    value: 'rsi',
    label: 'RSI 超卖反弹',
    desc: '监听 RSI < 30 的反转信号',
    icon: <TrendingDown className="w-5 h-5 text-emerald-500" />,
  },
  {
    value: 'whale',
    label: '主力大单流踪',
    desc: '追踪异常大单资金流向',
    icon: <Zap className="w-5 h-5 text-purple-500" />,
  },
];
