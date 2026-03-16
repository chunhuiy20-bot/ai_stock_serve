/*
 * 模块职责
 * - 提供全局 WebSocket 监听器，接收后端坐标指令并转发给前端移动系统。
 *
 * 运行/调用顺序
 * 1. main 启动时调用 startGlobalWsListener(...)。
 * 2. 监听器连接后端，解析消息。
 * 3. 识别到移动指令后调用 onMoveCommand(...)。
 *
 * 函数概述
 * - startGlobalWsListener(context): 启动或复用全局 WebSocket 监听器。
 */

let singleton = null;

function readWsUrlFromRuntime() {
  const fromGlobal = window.__AI_WORLD_WS_URL__;
  if (typeof fromGlobal === "string" && fromGlobal.trim()) return fromGlobal.trim();

  const fromQuery = new URLSearchParams(window.location.search).get("ws");
  if (typeof fromQuery === "string" && fromQuery.trim()) return fromQuery.trim();

  const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.hostname || "127.0.0.1";
  return `${wsProtocol}://${host}:8000/ws`;
}

function normalizeMovePayload(payload) {
  if (!payload || typeof payload !== "object") return null;

  // 支持两种结构：
  // 1) { type: "agent_move", actorId, target: { x, y, mapUrl } }
  // 2) { type: "move", actorId, x, y, mapUrl }
  const actorId = payload.actorId || payload.actor_id || payload.agentId || payload.agent_id;
  const target = payload.target && typeof payload.target === "object" ? payload.target : payload;
  const x = Number(target.x);
  const y = Number(target.y);
  const mapUrl = target.mapUrl || target.map_url || target.floor;
  const requestId = payload.requestId || payload.request_id || target.requestId || target.request_id;

  if (!actorId || !Number.isFinite(x) || !Number.isFinite(y)) return null;
  return {
    actorId: String(actorId),
    x: Math.trunc(x),
    y: Math.trunc(y),
    mapUrl: mapUrl ? String(mapUrl) : undefined,
    requestId: requestId ? String(requestId) : undefined,
  };
}

function isMoveEvent(payload) {
  if (!payload || typeof payload !== "object") return false;
  const t = String(payload.type || "").toLowerCase();
  if (t === "agent_move" || t === "move" || t === "agent.command.move") return true;
  // 兜底：如果结构上像移动命令，也接受。
  return Boolean(normalizeMovePayload(payload));
}

export function startGlobalWsListener({
  wsUrl,
  getActorById,
  onMoveCommand,
  setStatus,
  reconnectDelayMs = 1500,
}) {
  if (singleton) return singleton;

  const resolvedUrl = typeof wsUrl === "string" && wsUrl.trim() ? wsUrl.trim() : readWsUrlFromRuntime();
  if (!resolvedUrl) {
    console.info("[ws] skipped: set window.__AI_WORLD_WS_URL__ or ?ws=ws://host/path");
    return null;
  }

  let ws = null;
  let manuallyClosed = false;
  let reconnectTimer = null;

  const scheduleReconnect = () => {
    if (manuallyClosed || reconnectTimer) return;
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, reconnectDelayMs);
  };

  const connect = () => {
    try {
      ws = new WebSocket(resolvedUrl);
    } catch (err) {
      console.error("[ws] connect failed:", err);
      scheduleReconnect();
      return;
    }

    ws.addEventListener("open", () => {
      if (typeof setStatus === "function") setStatus("WS connected");
      console.info("[ws] connected:", resolvedUrl);
    });

    ws.addEventListener("message", (event) => {
      let payload = null;
      try {
        payload = JSON.parse(String(event.data || "{}"));
      } catch (err) {
        console.warn("[ws] invalid json:", event.data);
        return;
      }

      if (!isMoveEvent(payload)) return;
      const move = normalizeMovePayload(payload);
      if (!move) return;

      const actor = getActorById?.(move.actorId);
      if (!actor) {
        console.warn("[ws] actor not found:", move.actorId);
        return;
      }

      onMoveCommand?.(actor, {
        x: move.x,
        y: move.y,
        mapUrl: move.mapUrl,
        requestId: move.requestId,
        source: "ai-backend",
      });
    });

    ws.addEventListener("close", () => {
      if (typeof setStatus === "function") setStatus("WS disconnected");
      console.info("[ws] disconnected");
      scheduleReconnect();
    });

    ws.addEventListener("error", (err) => {
      console.error("[ws] error:", err);
    });
  };

  const close = () => {
    manuallyClosed = true;
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws && ws.readyState <= 1) ws.close();
    ws = null;
    singleton = null;
  };

  connect();

  singleton = {
    get url() {
      return resolvedUrl;
    },
    get socket() {
      return ws;
    },
    close,
  };

  // 暴露给控制台，方便你后续联调。
  window.__AI_WORLD_WS_CLIENT__ = singleton;
  return singleton;
}
