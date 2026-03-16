/*
 * 模块职责
 * - 负责门系统构建、门开关状态更新、门 tile 帧映射。
 *
 * 运行/调用顺序
 * 1. loadSceneState() 调用 buildDoorSystem() 初始化门系统。
 * 2. 运行时每帧 updateDoors() 更新开合度。
 * 3. 渲染时 mapDoorGid() 映射当前门帧。
 *
 * 函数概述
 * - buildDoorSystem(map): 构建门交互系统。
 * - updateDoors(doorSystem, actors, map, dt): 更新门开关状态。
 * - mapDoorGid(gid, tileIndex, doorSystem): 计算门当前绘制 gid。
 */

const AUTO_DOOR_TILESET_HINT = "animated_elevator_door_entrance_1_32x32";

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

export function buildDoorSystem(map) {
  const doorLayer = map.layers.find((l) => l.name.toLowerCase() === "door");
  if (!doorLayer) return null;

  const doorTs = map.tilesets.find((t) => t.name.includes(AUTO_DOOR_TILESET_HINT) || t.sourceName.includes("animated_elevator"));
  if (!doorTs || !doorTs.image) return null;

  const cols = doorTs.columns;
  const frameCount = Math.max(1, Math.floor(cols / 2));
  const openFrame = Math.floor((frameCount - 1) / 2);
  const first = doorTs.firstgid;
  const last = first + doorTs.tilecount - 1;

  const candidates = new Set();
  for (let i = 0; i < doorLayer.data.length; i += 1) {
    const gid = doorLayer.data[i];
    if (gid >= first && gid <= last) candidates.add(i);
  }

  const built = buildAdjacencyGroups(map, candidates);
  const groups = built.groups.map((g) => ({ ...g, open: 0, holdTimer: 0 }));

  return {
    firstgid: first,
    lastgid: last,
    columns: cols,
    openFrame,
    groups,
    tileGroup: built.tileGroup,
    openSpeed: 5.5,
    closeSpeed: 4.0,
    triggerDistance: 2,
    holdOpenSeconds: 0.7,
  };
}

export function updateDoors(doorSystem, actors, map, dt) {
  if (!doorSystem || !actors.length || !map) return;

  for (const group of doorSystem.groups) {
    let minDist = Infinity;
    for (const idx of group.tiles) {
      const tx = idx % map.width;
      const ty = Math.floor(idx / map.width);
      for (const actor of actors) {
        const actorTileX = Math.floor(actor.x / map.tileWidth);
        const actorTileY = Math.floor(actor.y / map.tileHeight);
        const dist = Math.abs(tx - actorTileX) + Math.abs(ty - actorTileY);
        if (dist < minDist) minDist = dist;
      }
    }

    const near = minDist <= doorSystem.triggerDistance;
    if (near) {
      group.holdTimer = doorSystem.holdOpenSeconds;
      group.open = Math.min(1, group.open + dt * doorSystem.openSpeed);
      continue;
    }

    if (group.holdTimer > 0) {
      group.holdTimer = Math.max(0, group.holdTimer - dt);
      group.open = Math.min(1, group.open + dt * doorSystem.openSpeed * 0.25);
      continue;
    }

    group.open = Math.max(0, group.open - dt * doorSystem.closeSpeed);
  }
}

export function mapDoorGid(gid, tileIndex, doorSystem) {
  if (!doorSystem) return gid;
  if (gid < doorSystem.firstgid || gid > doorSystem.lastgid) return gid;

  const groupId = doorSystem.tileGroup.get(tileIndex);
  if (groupId == null) return gid;

  const local = gid - doorSystem.firstgid;
  const row = Math.floor(local / doorSystem.columns);
  const side = local % 2;
  const targetFrame = Math.round(doorSystem.groups[groupId].open * doorSystem.openFrame);
  const newLocal = row * doorSystem.columns + targetFrame * 2 + side;
  return doorSystem.firstgid + newLocal;
}
