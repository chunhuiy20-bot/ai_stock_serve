/*
 * 模块职责
 * - 负责创建角色对象与初始角色列表。
 *
 * 运行/调用顺序
 * 1. loadSceneState() 首次加载场景时调用 createActors()。
 * 2. createActors() 内部调用 createActor() 生成标准角色结构。
 *
 * 函数概述
 * - createActor(id, name, roleKey, x, y, mapUrl): 创建单个角色数据。
 * - createActors(context): 计算初始出生点并返回默认角色列表。
 */

export function createActor(id, name, roleKey, x, y, mapUrl) {
  return {
    id,
    name,
    roleKey,
    x,
    y,
    mapUrl,
    speed: 120,
    dir: "down",
    walkTime: 0,
    moving: false,
    path: [],
    sitTask: null,
    isSitting: false,
    seatedChair: null,
    screenAnimOn: false,
    screenAnimTime: 0,
    activeScreenGroupId: null,
    activeTradingScreenGroupId: null,
  };
}

export function createActors({ map, blocked, currentMapUrl, isWalkable, tileToWorldCenter }) {
  let spawn = null;
  for (let y = 1; y < map.height - 1 && !spawn; y += 1) {
    for (let x = 1; x < map.width - 1; x += 1) {
      if (isWalkable(map, blocked, x, y)) {
        spawn = tileToWorldCenter(map, x, y);
        break;
      }
    }
  }

  const p = spawn || { x: map.tileWidth / 2, y: map.tileHeight / 2 };
  return [
    createActor("default", "Edward", "default", p.x, p.y, currentMapUrl),
    createActor("bob", "Bob", "bob", p.x + map.tileWidth * 1.2, p.y, currentMapUrl),
  ];
}
