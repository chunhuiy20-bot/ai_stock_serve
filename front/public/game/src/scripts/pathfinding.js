/*
 * 模块职责
 * - 提供阻挡网格构建与 A* 自动寻路能力。
 *
 * 运行/调用顺序
 * 1. 场景加载时 buildBlockedGrid() 生成阻挡数据。
 * 2. 下发移动命令时 findNearestWalkableGoal()/findPath() 计算路径。
 *
 * 函数概述
 * - buildBlockedGrid(map, ...): 构建可行走阻挡网格。
 * - isWalkable(map, blocked, tx, ty): 判断 tile 可通行性。
 * - findPath(map, blocked, start, goal): A* 路径搜索。
 * - findNearestWalkableGoal(map, blocked, goal, start, maxRadius): 寻找可达目标点。
 */

const DEFAULT_COLLISION_LAYER_HINTS = ["wall", "borders", "window", "surveillance", "table", "chair", "tool", "clutter"];
const DEFAULT_WALKABLE_LAYER_HINTS = ["floor", "door", "department", "trading", "risk_management", "research"];

function indexOfTile(map, tx, ty) {
  return ty * map.width + tx;
}

export function buildBlockedGrid(
  map,
  collisionLayerHints = DEFAULT_COLLISION_LAYER_HINTS,
  walkableLayerHints = DEFAULT_WALKABLE_LAYER_HINTS
) {
  const total = map.width * map.height;
  const blocked = new Array(total).fill(false);

  for (const layer of map.layers) {
    const lower = layer.name.toLowerCase();
    if (walkableLayerHints.some((n) => lower.includes(n))) continue;
    if (!collisionLayerHints.some((n) => lower.includes(n))) continue;
    for (let i = 0; i < total; i += 1) {
      if (layer.data[i] > 0) blocked[i] = true;
    }
  }

  return blocked;
}

export function isWalkable(map, blocked, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return false;
  return !blocked[indexOfTile(map, tx, ty)];
}

export function findPath(map, blocked, start, goal) {
  if (!isWalkable(map, blocked, goal.x, goal.y)) return [];
  const key = (x, y) => `${x},${y}`;
  const gScore = new Map();
  const fScore = new Map();
  const from = new Map();
  const open = [start];

  gScore.set(key(start.x, start.y), 0);
  fScore.set(key(start.x, start.y), Math.abs(goal.x - start.x) + Math.abs(goal.y - start.y));

  while (open.length) {
    let bestIndex = 0;
    let bestNode = open[0];
    let bestF = fScore.get(key(bestNode.x, bestNode.y)) ?? Infinity;

    for (let i = 1; i < open.length; i += 1) {
      const node = open[i];
      const f = fScore.get(key(node.x, node.y)) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        bestNode = node;
        bestIndex = i;
      }
    }

    const current = bestNode;
    open.splice(bestIndex, 1);

    if (current.x === goal.x && current.y === goal.y) {
      const path = [];
      let cursorKey = key(goal.x, goal.y);
      while (from.has(cursorKey)) {
        const [xStr, yStr] = cursorKey.split(",");
        path.push({ x: Number(xStr), y: Number(yStr) });
        cursorKey = from.get(cursorKey);
      }
      path.reverse();
      return path;
    }

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const n of neighbors) {
      if (!isWalkable(map, blocked, n.x, n.y)) continue;
      const nKey = key(n.x, n.y);
      const cKey = key(current.x, current.y);
      const tentative = (gScore.get(cKey) ?? Infinity) + 1;

      if (tentative < (gScore.get(nKey) ?? Infinity)) {
        from.set(nKey, cKey);
        gScore.set(nKey, tentative);
        fScore.set(nKey, tentative + Math.abs(goal.x - n.x) + Math.abs(goal.y - n.y));
        if (!open.some((o) => o.x === n.x && o.y === n.y)) open.push(n);
      }
    }
  }

  return [];
}

export function findNearestWalkableGoal(map, blocked, goal, start, maxRadius = 8) {
  if (isWalkable(map, blocked, goal.x, goal.y)) return goal;

  let best = null;
  let bestCost = Infinity;

  for (let r = 1; r <= maxRadius; r += 1) {
    for (let y = goal.y - r; y <= goal.y + r; y += 1) {
      for (let x = goal.x - r; x <= goal.x + r; x += 1) {
        const onRing = x === goal.x - r || x === goal.x + r || y === goal.y - r || y === goal.y + r;
        if (!onRing) continue;
        if (!isWalkable(map, blocked, x, y)) continue;

        const toGoal = Math.abs(x - goal.x) + Math.abs(y - goal.y);
        const toStart = Math.abs(x - start.x) + Math.abs(y - start.y);
        const cost = toGoal * 10 + toStart;

        if (cost < bestCost) {
          bestCost = cost;
          best = { x, y };
        }
      }
    }

    if (best) return best;
  }

  return null;
}
