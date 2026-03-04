const BASE_URL = 'http://localhost:8001/api/stock';

export interface HotSectorBrief {
  id: string;
  record_date: string;
  sector_name: string;
  heat_index: number;
  narrative: string;
  catalysts: string[];
  risk_tips: string;
  create_time: string;
}

export async function fetchTodayHotSectors(): Promise<HotSectorBrief[]> {
  const res = await fetch(`${BASE_URL}/hot-sector/today/list`);
  if (!res.ok) throw new Error('Failed to fetch hot sectors');
  const json = await res.json();
  return json.data as HotSectorBrief[];
}

export interface SectorKeyStock {
  id: string;
  symbol: string;
  name: string;
  reason: string;
  momentum_score: number;
}

export interface SectorChainNews {
  title: string;
  summary: string;
  source_url: string;
}

export interface SectorChain {
  id: string;
  chain_type: string;
  stage: string;
  description: string;
  key_stocks: SectorKeyStock[];
  news: SectorChainNews[];
}

export interface SectorDetail extends HotSectorBrief {
  upstream: SectorChain;
  midstream: SectorChain;
  downstream: SectorChain;
}

export async function fetchSectorDetail(id: string): Promise<SectorDetail> {
  const res = await fetch(`${BASE_URL}/hot-sector/detail/${id}`);
  if (!res.ok) throw new Error('Failed to fetch sector detail');
  const json = await res.json();
  return json.data as SectorDetail;
}

export interface WatchlistStock {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change_percent: number;
  create_time: string;
  update_time: string;
}

export async function fetchUserWatchlist(userId = '1'): Promise<WatchlistStock[]> {
  const res = await fetch(`${BASE_URL}/user/${userId}/list`);
  if (!res.ok) throw new Error('Failed to fetch watchlist');
  const json = await res.json();
  return json.data as WatchlistStock[];
}

