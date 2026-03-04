// 自选股（仅股票）
export const watchlistStocks = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.',       price: '$824.15', change: '+2.45%', positive: true  },
  { symbol: 'AAPL', name: 'Apple Inc.',          price: '$172.50', change: '-0.80%', positive: false },
  { symbol: 'TSLA', name: 'Tesla, Inc.',         price: '$201.40', change: '+1.50%', positive: true  },
  { symbol: 'MSFT', name: 'Microsoft Corp.',     price: '$415.20', change: '+0.92%', positive: true  },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.',    price: '$198.30', change: '+1.12%', positive: true  },
  { symbol: 'GOOGL', name: 'Alphabet Inc.',      price: '$175.80', change: '-0.35%', positive: false },
];

// 热门板块
export const hotSectors = [
  { id: 'ai-semi',    name: 'AI 半导体',         change: '+3.82%', positive: true,  icon: 'cpu'          },
  { id: 'clean-energy', name: '新能源与清洁能源', change: '+2.15%', positive: true,  icon: 'sun'          },
  { id: 'oil-gas',    name: '传统能源 (Oil/Gas)', change: '+0.95%', positive: true,  icon: 'fuel'         },
  { id: 'biotech',    name: '生物制药',           change: '-1.20%', positive: false, icon: 'flask-conical'},
];

// 量化策略
export const strategies = [
  {
    id: 'rsi-oversold',
    name: 'RSI 极度超卖反弹',
    desc: '捕捉 RSI < 30 的个股，结合主力资金净流入进行二次确认...',
    status: '实时监听中',
    count: 12,
    icon: 'trending-down',
  },
  {
    id: 'macd-golden-cross',
    name: 'MACD 金叉突破',
    desc: '捕捉 MACD 金叉信号，趋势跟踪策略，适合中线持有...',
    status: '实时监听中',
    count: 5,
    icon: 'git-merge',
  },
  {
    id: 'volume-breakout',
    name: '放量突破新高',
    desc: '成交量放大 2 倍以上并突破近期高点，动量策略...',
    status: '实时监听中',
    count: 3,
    icon: 'bar-chart-2',
  },
];

// 策略筛选结果
export const strategyResults = [
  { symbol: 'AMD',  price: '$168.40', change: '+1.25%', positive: true,  match: '94%' },
  { symbol: 'TSLA', price: '$201.40', change: '+1.50%', positive: true,  match: '91%' },
  { symbol: 'AAPL', price: '$172.50', change: '-0.80%', positive: false, match: '88%' },
  { symbol: 'NFLX', price: '$612.00', change: '+0.40%', positive: true,  match: '85%' },
  { symbol: 'PYPL', price: '$62.45',  change: '-1.60%', positive: false, match: '82%' },
  { symbol: 'SNAP', price: '$11.20',  change: '-3.20%', positive: false, match: '79%' },
  { symbol: 'UBER', price: '$68.90',  change: '+0.70%', positive: true,  match: '77%' },
  { symbol: 'LYFT', price: '$14.30',  change: '-1.10%', positive: false, match: '74%' },
];

// 板块产业链数据
export const sectorChains: Record<string, {
  title: string;
  subtitle: string;
  upstream: ChainStock[];
  midstream: ChainStock[];
  downstream: ChainStock[];
  research: ResearchItem[];
}> = {
  'ai-semi': {
    title: 'AI 半导体产业链',
    subtitle: 'AI 产业链上中下游价值分布图',
    upstream: [
      { symbol: 'ASML', name: '光刻机设备',   price: '$942.10', change: '+1.2%', positive: true  },
      { symbol: 'AMAT', name: '半导体设备',   price: '$198.50', change: '+0.8%', positive: true  },
      { symbol: 'LRCX', name: '刻蚀设备',     price: '$875.30', change: '-0.3%', positive: false },
    ],
    midstream: [
      { symbol: 'TSM',  name: '晶圆制造',     price: '$142.30', change: '+2.1%', positive: true  },
      { symbol: 'NVDA', name: '核心 GPU',      price: '$824.15', change: '+2.4%', positive: true  },
      { symbol: 'AMD',  name: 'CPU/GPU 设计', price: '$168.40', change: '+1.2%', positive: true  },
    ],
    downstream: [
      { symbol: 'MSFT', name: '云服务商',     price: '$415.12', change: '+0.8%', positive: true  },
      { symbol: 'GOOGL', name: 'AI 应用',     price: '$175.80', change: '-0.3%', positive: false },
      { symbol: 'META', name: '元宇宙/AI',    price: '$512.40', change: '+1.5%', positive: true  },
    ],
    research: [
      { tag: '行业深度', title: '2026年 2nm 晶圆量产对上游光刻设备的拉动分析：关键技术瓶颈已突破。', time: '3 小时前', source: '产业网', views: '2.1k' },
      { tag: '机构报告', title: 'AI 算力需求 2026 年将同比增长 180%，NVDA 数据中心营收有望突破 $1000 亿。', time: '昨天', source: '高盛研究', views: '5.8k' },
    ],
  },
  'clean-energy': {
    title: '新能源与清洁能源产业链',
    subtitle: '清洁能源产业链上中下游价值分布图',
    upstream: [
      { symbol: 'ALB',  name: '锂矿开采',     price: '$112.30', change: '+0.5%', positive: true  },
      { symbol: 'MP',   name: '稀土材料',     price: '$18.40',  change: '-1.2%', positive: false },
    ],
    midstream: [
      { symbol: 'TSLA', name: '电动汽车',     price: '$201.40', change: '+1.5%', positive: true  },
      { symbol: 'ENPH', name: '光伏逆变器',   price: '$98.20',  change: '+2.3%', positive: true  },
    ],
    downstream: [
      { symbol: 'NEE',  name: '清洁电力运营', price: '$72.50',  change: '+0.6%', positive: true  },
      { symbol: 'FSLR', name: '太阳能组件',   price: '$185.60', change: '+1.8%', positive: true  },
    ],
    research: [
      { tag: '政策解读', title: '美国 IRA 法案补贴细则落地，清洁能源企业受益明显。', time: '5 小时前', source: '能源周刊', views: '1.3k' },
    ],
  },
  'oil-gas': {
    title: '传统能源 (Oil/Gas) 产业链',
    subtitle: '油气产业链上中下游价值分布图',
    upstream: [
      { symbol: 'XOM',  name: '上游勘探开采', price: '$112.80', change: '+0.9%', positive: true  },
      { symbol: 'CVX',  name: '综合石油',     price: '$158.40', change: '+0.7%', positive: true  },
    ],
    midstream: [
      { symbol: 'KMI',  name: '管道运输',     price: '$21.30',  change: '+0.3%', positive: true  },
      { symbol: 'WMB',  name: '天然气管道',   price: '$38.90',  change: '+0.5%', positive: true  },
    ],
    downstream: [
      { symbol: 'VLO',  name: '炼油与销售',   price: '$162.50', change: '+1.1%', positive: true  },
      { symbol: 'PSX',  name: '石油精炼',     price: '$148.20', change: '+0.8%', positive: true  },
    ],
    research: [
      { tag: '市场分析', title: 'OPEC+ 维持减产协议，油价短期支撑较强，关注 XOM 和 CVX 配置机会。', time: '2 小时前', source: '能源情报', views: '980' },
    ],
  },
  'biotech': {
    title: '生物制药产业链',
    subtitle: '生物制药产业链上中下游价值分布图',
    upstream: [
      { symbol: 'TMO',  name: '生命科学工具', price: '$548.20', change: '-0.5%', positive: false },
      { symbol: 'DHR',  name: '诊断设备',     price: '$238.40', change: '-0.8%', positive: false },
    ],
    midstream: [
      { symbol: 'MRNA', name: 'mRNA 研发',    price: '$68.30',  change: '-2.1%', positive: false },
      { symbol: 'BNTX', name: '疫苗研发',     price: '$112.50', change: '-1.5%', positive: false },
    ],
    downstream: [
      { symbol: 'JNJ',  name: '综合医疗',     price: '$158.90', change: '-0.3%', positive: false },
      { symbol: 'PFE',  name: '制药销售',     price: '$28.40',  change: '-1.2%', positive: false },
    ],
    research: [
      { tag: '行业动态', title: 'FDA 审批节奏放缓，生物制药板块短期承压，关注管线丰富的标的。', time: '1 小时前', source: '医药观察', views: '1.5k' },
    ],
  },
};

export interface ChainStock {
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
}

export interface ResearchItem {
  tag: string;
  title: string;
  time: string;
  source: string;
  views: string;
}

// 股票详情页新闻
export const stockNews = [
  { title: '2026 财报预测上调，市场情绪乐观...', time: '12 分钟前', source: '财经频道' },
  { title: 'AI 芯片需求持续旺盛，机构纷纷上调目标价...', time: '1 小时前', source: '华尔街见闻' },
  { title: '数据中心业务 Q1 营收超预期 18%...', time: '3 小时前', source: '彭博社' },
  { title: '大摩将目标价上调至 $950，维持增持评级...', time: '昨天', source: 'Morgan Stanley' },
];

// AI 历史研判
export const aiHistory = [
  { type: 'bullish', label: '发出看多信号', time: '2026-02-27 10:15', desc: '"检测到大量机构买单成交，技术面呈多头排列。"' },
  { type: 'neutral',  label: '发出观望提示', time: '2026-02-20 14:30', desc: '"短期均线出现粘合，建议等待方向选择后再介入。"' },
  { type: 'bullish', label: '发出看多信号', time: '2026-02-10 09:45', desc: '"RSI 从超卖区域反弹，量能配合良好，趋势向上。"' },
];

// 宏观叙事关联图谱
export const narrativeTags = [
  { label: '算力基建',   color: 'blue',   pct: 85 },
  { label: '降息预期',   color: 'emerald', pct: 40 },
  { label: '主权 AI 竞赛', color: 'purple', pct: 65 },
  { label: '地缘风险',   color: 'red',    pct: 30 },
];

