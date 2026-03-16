/*
 * 模块职责
 * - 负责服务器设备动画系统构建与服务器 tile 帧映射。
 *
 * 运行/调用顺序
 * 1. 场景加载时 buildServerSystem() 初始化系统。
 * 2. 渲染时 mapServerGid() 根据时间映射当前帧。
 *
 * 函数概述
 * - buildServerSystem(map): 构建服务器动画系统。
 * - mapServerGid(gid, tileIndex, serverSystem, timeSec): 计算服务器绘制 gid。
 */

const SERVER_TILESET_HINT = "animated_control_room_server_32x32";

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

export function buildServerSystem(map) {
  const ts = map.tilesets.find((t) => t.name.includes(SERVER_TILESET_HINT) || t.sourceName.includes(SERVER_TILESET_HINT));
  if (!ts || !ts.image) return null;

  const firstgid = ts.firstgid;
  const lastgid = ts.firstgid + ts.tilecount - 1;
  const candidates = collectTilesetCandidates(map, firstgid, lastgid);
  const built = buildAdjacencyGroups(map, candidates);

  return {
    firstgid,
    lastgid,
    columns: Math.max(1, ts.columns),
    fps: 6,
    frameTileH: 3,
    tileGroup: built.tileGroup,
  };
}

export function mapServerGid(gid, tileIndex, serverSystem, timeSec) {
  if (!serverSystem) return gid;
  if (gid < serverSystem.firstgid || gid > serverSystem.lastgid) return gid;
  const groupId = serverSystem.tileGroup.get(tileIndex);
  if (groupId == null) return gid;

  const local = gid - serverSystem.firstgid;
  const row = Math.floor(local / serverSystem.columns);
  const offRow = row % serverSystem.frameTileH;
  const frame = Math.floor(timeSec * serverSystem.fps) % serverSystem.columns;
  return serverSystem.firstgid + offRow * serverSystem.columns + frame;
}
