/*
 * 模块职责
 * - 负责角色与监控/交易交互点（含椅子就座）的移动任务生成。
 *
 * 运行/调用顺序
 * 1. dispatchActorMoveCommand() 调用 issueMoveCommand()。
 * 2. issueMoveCommand() 判定交互域、查找椅子、生成 sitTask 与路径。
 *
 * 函数概述
 * - issueMoveCommand(actor, rawGoal, context): 生成角色移动路径与交互任务。
 */

const INTERACTABLE_LAYER_HINTS = ["surveillance", "table", "chair", "tool", "clutter"];
const CHAIR_LAYER_HINT = "chair";
const SURVEILLANCE_INTERACT_HINT = "surveillance_system";
const TRADING_INTERACT_HINT = "trading_floor_computer";

function isTileInLayer(layer, map, tx, ty) {
  if (!layer) return false;
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return false;
  return (layer.data[ty * map.width + tx] || 0) > 0;
}

function findNearestOccupiedInLayer(map, layer, from, maxRadius = 8) {
  if (!layer) return null;
  if (isTileInLayer(layer, map, from.x, from.y)) return { x: from.x, y: from.y };

  for (let r = 1; r <= maxRadius; r += 1) {
    for (let y = from.y - r; y <= from.y + r; y += 1) {
      for (let x = from.x - r; x <= from.x + r; x += 1) {
        const onRing = x === from.x - r || x === from.x + r || y === from.y - r || y === from.y + r;
        if (!onRing) continue;
        if (isTileInLayer(layer, map, x, y)) return { x, y };
      }
    }
  }

  return null;
}

function getConnectedChairCluster(map, layer, startTile) {
  if (!layer || !startTile || !isTileInLayer(layer, map, startTile.x, startTile.y)) return null;

  const key = (x, y) => `${x},${y}`;
  const visited = new Set([key(startTile.x, startTile.y)]);
  const stack = [{ x: startTile.x, y: startTile.y }];
  const tiles = [];

  while (stack.length) {
    const cur = stack.pop();
    tiles.push(cur);
    const neighbors = [
      { x: cur.x + 1, y: cur.y },
      { x: cur.x - 1, y: cur.y },
      { x: cur.x, y: cur.y + 1 },
      { x: cur.x, y: cur.y - 1 },
    ];

    for (const n of neighbors) {
      if (n.x < 0 || n.y < 0 || n.x >= map.width || n.y >= map.height) continue;
      if (!isTileInLayer(layer, map, n.x, n.y)) continue;
      const k = key(n.x, n.y);
      if (visited.has(k)) continue;
      visited.add(k);
      stack.push(n);
    }
  }

  let sumX = 0;
  let sumY = 0;
  let minY = Infinity;
  for (const t of tiles) {
    sumX += t.x;
    sumY += t.y;
    if (t.y < minY) minY = t.y;
  }
  const center = { x: sumX / tiles.length, y: sumY / tiles.length };
  const topRowTiles = tiles.filter((t) => t.y === minY);
  const sitPoint = { x: topRowTiles.reduce((acc, t) => acc + t.x, 0) / topRowTiles.length, y: minY };
  return { tiles, center, sitPoint };
}

function isInteractableClick(map, tx, ty) {
  for (const layer of map.layers) {
    const lower = layer.name.toLowerCase();
    if (!INTERACTABLE_LAYER_HINTS.some((h) => lower.includes(h))) continue;
    if (isTileInLayer(layer, map, tx, ty)) return true;
  }
  return false;
}

function getInteractDomain(map, tx, ty) {
  for (const layer of map.layers) {
    const lower = layer.name.toLowerCase();
    if (!INTERACTABLE_LAYER_HINTS.some((h) => lower.includes(h))) continue;
    if (!isTileInLayer(layer, map, tx, ty)) continue;
    if (lower.includes(TRADING_INTERACT_HINT)) return "trading";
    if (lower.includes(SURVEILLANCE_INTERACT_HINT)) return "surveillance";
  }
  return null;
}

function getChairLayersByDomain(map, domain) {
  return map.layers.filter((l) => {
    const lower = l.name.toLowerCase();
    if (!lower.includes(CHAIR_LAYER_HINT)) return false;
    if (domain === "trading") return lower.includes(TRADING_INTERACT_HINT);
    if (domain === "surveillance") return lower.includes(SURVEILLANCE_INTERACT_HINT);
    return true;
  });
}

function findNearestChairFromLayers(map, layers, from, maxRadius = 10) {
  let best = null;
  let bestDist = Infinity;
  for (const layer of layers) {
    const t = findNearestOccupiedInLayer(map, layer, from, maxRadius);
    if (!t) continue;
    const d = Math.abs(t.x - from.x) + Math.abs(t.y - from.y);
    if (d < bestDist) {
      bestDist = d;
      best = { tile: t, layer };
    }
  }
  return best;
}

function findNearestGroup(groups, p) {
  if (!groups?.length) return null;
  let id = null;
  let dist = Infinity;
  for (const g of groups) {
    const d = Math.abs(g.center.x - p.x) + Math.abs(g.center.y - p.y);
    if (d < dist) {
      dist = d;
      id = g.id;
    }
  }
  return id;
}

export function issueMoveCommand(actor, rawGoal, context) {
  const { map, blocked, worldToTile, findNearestWalkableGoal, findPath, screenGroups, tradingScreenGroups } = context;
  if (!map || !blocked || !actor) return;

  const start = worldToTile(map, actor.x, actor.y);
  actor.isSitting = false;
  actor.screenAnimOn = false;
  actor.activeScreenGroupId = null;
  actor.activeTradingScreenGroupId = null;
  actor.seatedChair = null;
  actor.sitTask = null;

  const clickedInteractable = isInteractableClick(map, rawGoal.x, rawGoal.y);
  const interactDomain = clickedInteractable ? getInteractDomain(map, rawGoal.x, rawGoal.y) : null;
  let anchorTile = rawGoal;
  let chairInfo = null;
  let chairLayerName = null;

  if (clickedInteractable) {
    const chairLayers = getChairLayersByDomain(map, interactDomain);
    const nearest = findNearestChairFromLayers(map, chairLayers, rawGoal, 10);
    if (nearest) {
      chairLayerName = nearest.layer.name;
      chairInfo = getConnectedChairCluster(map, nearest.layer, nearest.tile);
      if (chairInfo) {
        anchorTile = {
          x: Math.round(chairInfo.sitPoint?.x ?? chairInfo.center.x),
          y: Math.round(chairInfo.sitPoint?.y ?? chairInfo.center.y),
        };
      } else {
        anchorTile = nearest.tile;
      }
    }
  }

  const goal = findNearestWalkableGoal(map, blocked, anchorTile, start, 10);
  if (!goal) return;

  if (clickedInteractable) {
    const chairForTask = chairInfo || {
      x: anchorTile.x,
      y: anchorTile.y,
      center: { x: anchorTile.x, y: anchorTile.y },
      sitPoint: { x: anchorTile.x, y: anchorTile.y },
      tiles: [anchorTile],
    };
    chairForTask.layerName = chairLayerName;
    const targetCenter = chairForTask.center || anchorTile;
    actor.sitTask = {
      goal,
      chair: chairForTask,
      domain: interactDomain,
      screenGroupId: interactDomain === "surveillance" ? findNearestGroup(screenGroups, targetCenter) : null,
      tradingScreenGroupId: interactDomain === "trading" ? findNearestGroup(tradingScreenGroups, targetCenter) : null,
    };
  }

  actor.path = findPath(map, blocked, start, goal);
}
