import { ExternalLink, Gamepad2 } from 'lucide-react';

export function GamePage() {
  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-sky-500/20 bg-[linear-gradient(135deg,rgba(8,47,73,0.92),rgba(15,23,42,0.96))] p-5 shadow-[0_18px_70px_rgba(14,116,144,0.18)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
              <Gamepad2 className="h-3.5 w-3.5" />
              Trading World
            </p>
            <h1 className="text-2xl font-semibold text-white">地图指挥台</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              已将控制板和地图舞台做成两个独立区域，交互逻辑保留不变，视觉上彻底分层。
            </p>
          </div>
          <a
            href="/game/index.html"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-400/40 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            新窗口打开
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <iframe title="Trading World Game" src="/game/index.html" className="game-shell-frame" />
      </div>
    </section>
  );
}
