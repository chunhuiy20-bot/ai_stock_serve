/*
 * 模块职责
 * - 负责监控屏动画系统构建与监控屏 tile 帧映射。
 *
 * 运行/调用顺序
 * 1. 场景加载时 buildScreenSystem() 初始化监控系统。
 * 2. 渲染时 mapScreenGid() 基于活跃角色交互状态映射帧。
 *
 * 函数概述
 * - buildScreenSystem(map, hint): 构建监控屏动画系统。
 * - mapScreenGid(gid, tileIndex, screenSystem, actors): 计算监控屏绘制 gid。
 */

const DEFAULT_SCREEN_TILESET_HINT = "animated_control_room_screens_32x32";

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
    const center = { x: sumX / tiles.length, y: sumY / tiles.length };

    const id = groups.length;
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

function getScreenDriverByGroup(actors, screenSystem, groupId) {
  if (groupId == null) return null;
  let best = null;
  const tileW = screenSystem?.tileWidth || 32;
  const tileH = screenSystem?.tileHeight || 32;

  for (const actor of actors || []) {
    if (!actor.screenAnimOn) continue;
    const actorTile = { x: actor.x / tileW, y: actor.y / tileH };
    const nearestGroupId = findNearestGroupId(screenSystem?.groups || [], actorTile);
    const candidateGroupId = nearestGroupId ?? actor.activeScreenGroupId;
    if (candidateGroupId !== groupId) continue;
    // Prefer the most recently seated actor in the same group.
    if (!best || actor.screenAnimTime < best.screenAnimTime) best = actor;
  }
  return best;
}

export function buildScreenSystem(map, hint = DEFAULT_SCREEN_TILESET_HINT) {
  const ts = map.tilesets.find((t) => t.name.includes(hint) || t.sourceName.includes("animated_control_room_screens"));
  if (!ts || !ts.image) return null;

  const frameTileW = 4;
  const frameTileH = 3;
  const columns = Math.max(1, ts.columns);
  const framesPerRowGroup = Math.max(1, Math.floor(columns / frameTileW));
  const candidates = collectTilesetCandidates(map, ts.firstgid, ts.firstgid + ts.tilecount - 1);
  const built = buildAdjacencyGroups(map, candidates);

  return {
    firstgid: ts.firstgid,
    lastgid: ts.firstgid + ts.tilecount - 1,
    columns,
    fps: 10,
    frameTileW,
    frameTileH,
    tileWidth: map.tileWidth,
    tileHeight: map.tileHeight,
    framesPerRowGroup,
    groups: built.groups,
    tileGroup: built.tileGroup,
  };
}

export function mapScreenGid(gid, tileIndex, screenSystem, actors) {
  if (!screenSystem) return gid;
  if (gid < screenSystem.firstgid || gid > screenSystem.lastgid) return gid;

  const gidGroupId = screenSystem.tileGroup.get(tileIndex);
  if (gidGroupId == null) return gid;

  // Pick animation driver by screen group, allowing multiple groups to animate at once.
  const driver = getScreenDriverByGroup(actors, screenSystem, gidGroupId);
  if (!driver) return gid;

  const local = gid - screenSystem.firstgid;
  const row = Math.floor(local / screenSystem.columns);
  const col = local % screenSystem.columns;
  const rowGroup = Math.floor(row / screenSystem.frameTileH);
  const offRow = row % screenSystem.frameTileH;
  const offCol = col % screenSystem.frameTileW;
  const frame = Math.floor(driver.screenAnimTime * screenSystem.fps) % screenSystem.framesPerRowGroup;
  const targetCol = frame * screenSystem.frameTileW + offCol;
  const targetRow = rowGroup * screenSystem.frameTileH + offRow;
  return screenSystem.firstgid + targetRow * screenSystem.columns + targetCol;
}
