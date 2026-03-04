import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Newspaper, TrendingUp, AlertTriangle, Flame } from 'lucide-react';
import { fetchSectorDetail, type SectorDetail } from '../../services/api';
import { ChainColumn } from '../../components/ChainColumn/ChainColumn';

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-gray-800 rounded-lg animate-pulse ${className ?? ''}`} />;
}

function SectorDetailSkeleton() {
  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 bg-gray-800 rounded-full animate-pulse" />
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-4 w-32" />
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-[#161a1e] border border-gray-800 rounded-2xl p-5 space-y-3">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-5/6" />
            <SkeletonBlock className="h-3 w-4/6" />
          </div>
        ))}
      </div>

      {/* Chain columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[0, 1, 2].map((col) => (
          <div key={col} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
              <div className="w-2 h-5 bg-gray-700 rounded-full animate-pulse" />
              <SkeletonBlock className="h-4 w-28" />
            </div>
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-4/5" />
            {[0, 1].map((card) => (
              <div key={card} className="bg-[#161a1e] p-5 rounded-2xl border border-gray-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-5 w-24" />
                    <SkeletonBlock className="h-3 w-16" />
                  </div>
                  <div className="w-7 h-7 bg-gray-800 rounded-lg animate-pulse" />
                </div>
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="h-3 w-4/5" />
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-800 rounded-full h-1.5 animate-pulse" />
                  <SkeletonBlock className="h-3 w-6" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* News section */}
      <div className="bg-[#161a1e] border border-gray-800 rounded-2xl p-6">
        <SkeletonBlock className="h-5 w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="p-4 bg-gray-900/40 rounded-xl border border-gray-800 space-y-2">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-3 w-5/6" />
              <SkeletonBlock className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SectorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchSectorDetail(id)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SectorDetailSkeleton />;
  if (error || !data) return <div className="text-red-400 p-8">{error ?? '板块数据不存在'}</div>;

  const allNews = [...data.upstream.news, ...data.midstream.news, ...data.downstream.news];

  return (
    <section className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{data.sector_name} 产业链</h2>
          <p className="text-gray-400 text-sm mt-1">{data.record_date} · 热度指数 {data.heat_index}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#161a1e] border border-gray-800 rounded-2xl p-5">
          <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4" /> 板块叙事
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">{data.narrative}</p>
        </div>
        <div className="bg-[#161a1e] border border-gray-800 rounded-2xl p-5">
          <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" /> 驱动因素
          </h4>
          <ul className="space-y-2">
            {data.catalysts.map((c, i) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">·</span>{c}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#161a1e] border border-gray-800 rounded-2xl p-5">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" /> 风险提示
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed">{data.risk_tips}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ChainColumn title={data.upstream.stage}   color="bg-blue-500"    description={data.upstream.description}   stocks={data.upstream.key_stocks}   />
        <ChainColumn title={data.midstream.stage}  color="bg-purple-500"  description={data.midstream.description}  stocks={data.midstream.key_stocks}  />
        <ChainColumn title={data.downstream.stage} color="bg-emerald-500" description={data.downstream.description} stocks={data.downstream.key_stocks} />
      </div>

      {allNews.length > 0 && (
        <div className="bg-[#161a1e] border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-blue-400">
            <Newspaper className="w-5 h-5" />
            板块相关资讯
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allNews.map((item, i) => (
              <a
                key={i}
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-gray-900/40 rounded-xl border border-gray-800 hover:border-gray-600 transition block"
              >
                <p className="text-sm font-medium text-gray-200 leading-relaxed">{item.title}</p>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">{item.summary}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
