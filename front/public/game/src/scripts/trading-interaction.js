/*
 * 模块职责
 * - 负责交易电脑动画系统构建与交易屏 tile 帧映射。
 *
 * 运行/调用顺序
 * 1. 场景加载时 buildTradingScreenSystem() 初始化系统。
 * 2. 渲染时 mapTradingScreenGid() 基于活跃交易角色映射帧。
 *
 * 函数概述
 * - buildTradingScreenSystem(map): 构建交易屏动画系统。
 * - mapTradingScreenGid(gid, tileIndex, tradingScreenSystem, actors): 计算交易屏绘制 gid。
 */

const TRADING_SCREEN_TILESET_HINT = "animated_control_room_facebook_scrolling_32x32";

function collectTilesetCandidates(map, firstgid, lastgid) {
  const candidates = new Set();
  for (const layer of map.layers) {
    for (let i = 0; i < layer.data.length; i += 1) {
      const gid = layer.data[i] || 0;
      if (gid >= firstgid && gid <= lastgid) candidates.add(i);
    }
  }
  return candidates;
}

function buildAdjacencyGroups(map, candidates) {
  const tileGroup = new Map();
  const groups = [];
  const visited = new Set();

  for (const start of candidates) {
    if (visited.has(start)) continue;
    const stack = [start];
    visited.add(start);
    const tiles = [];

    while (stack.length) {
      const idx = stack.pop();
      tiles.push(idx);
      const x = idx % map.width;
      const y = Math.floor(idx / map.width);
      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || ny < 0 || nx >= map.width || ny >= map.height) continue;
        const nIdx = ny * map.width + nx;
        if (!candidates.has(nIdx) || visited.has(nIdx)) continue;
        visited.add(nIdx);
        stack.push(nIdx);
      }
    }

    let sumX = 0;
    let sumY = 0;
    for (const idx of tiles) {
      sumX += idx % map.width;
      sumY += Math.floor(idx / map.width);
    }

    const id = groups.length;
    const center = { x: sumX / tiles.length, y: sumY / tiles.length };
    for (const idx of tiles) tileGroup.set(idx, id);
    groups.push({ id, tiles, center });
  }

  return { groups, tileGroup };
}

function findNearestGroupId(groups, p) {
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

function getTradingDriverByGroup(actors, tradingScreenSystem, groupId) {
  if (groupId == null) return null;
  let best = null;
  const tileW = tradingScreenSystem?.tileWidth || 32;
  const tileH = tradingScreenSystem?.tileHeight || 32;

  for (const actor of actors || []) {
    if (!actor.screenAnimOn) continue;
    const actorTile = { x: actor.x / tileW, y: actor.y / tileH };
    const nearestGroupId = findNearestGroupId(tradingScreenSystem?.groups || [], actorTile);
    const candidateGroupId = nearestGroupId ?? actor.activeTradingScreenGroupId;
    if (candidateGroupId !== groupId) continue;
    // Prefer the most recently seated actor in the same group.
    if (!best || actor.screenAnimTime < best.screenAnimTime) best = actor;
  }
  return best;
}

export function buildTradingScreenSystem(map) {
  const ts = map.tilesets.find((t) => t.name.includes(TRADING_SCREEN_TILESET_HINT) || t.sourceName.includes(TRADING_SCREEN_TILESET_HINT));
  if (!ts || !ts.image) return null;

  const firstgid = ts.firstgid;
  const lastgid = ts.firstgid + ts.tilecount - 1;
  const candidates = collectTilesetCandidates(map, firstgid, lastgid);
  const built = buildAdjacencyGroups(map, candidates);

  return {
    firstgid,
    lastgid,
    columns: Math.max(1, ts.columns),
    fps: 8,
    frameTileH: 2,
    tileWidth: map.tileWidth,
    tileHeight: map.tileHeight,
    tileGroup: built.tileGroup,
    groups: built.groups,
  };
}

export function mapTradingScreenGid(gid, tileIndex, tradingScreenSystem, actors) {
  if (!tradingScreenSystem) return gid;
  if (gid < tradingScreenSystem.firstgid || gid > tradingScreenSystem.lastgid) return gid;

  const groupId = tradingScreenSystem.tileGroup.get(tileIndex);
  if (groupId == null) return gid;

  // Pick animation driver by trading screen group, allowing multiple groups to animate at once.
  const driver = getTradingDriverByGroup(actors, tradingScreenSystem, groupId);
  if (!driver) return gid;

  const local = gid - tradingScreenSystem.firstgid;
  const row = Math.floor(local / tradingScreenSystem.columns);
  const offRow = row % tradingScreenSystem.frameTileH;
  const frame = Math.floor(driver.screenAnimTime * tradingScreenSystem.fps) % tradingScreenSystem.columns;
  return tradingScreenSystem.firstgid + offRow * tradingScreenSystem.columns + frame;
}
