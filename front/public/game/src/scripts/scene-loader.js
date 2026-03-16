/*
 * 模块职责
 * - 负责场景加载主流程：地图、系统初始化、角色创建与重定位。
 * - 负责按 mapUrl 缓存场景资源（sceneCache），避免切楼层时丢失楼层运行态。
 *
 * 运行/调用顺序
 * 1. main.loadScene() 调用 loadSceneState()。
 * 2. loadSceneState() 优先读取 sceneCache；未命中时加载地图并初始化系统。
 * 3. 根据需要创建角色或执行跨楼层重定位。
 *
 * 函数概述
 * - loadSceneState(context): 完成一次场景加载与状态更新。
 */

export async function loadSceneState({
  mapUrl,
  spawnLayerName = null,
  spawnOffset = { x: 0, y: 0 },
  transferActorId = null,
  state,
  deps,
}) {
  const {
    loadTmjMap,
    buildBlockedGrid,
    buildDoorSystem,
    buildScreenSystem,
    buildServerSystem,
    buildTradingScreenSystem,
    createActors,
    isWalkable,
    tileToWorldCenter,
    findFirstTileInLayer,
    findNearestWalkableGoal,
    setupRoleSelector,
    setupCommandRoleSelector,
    setupPoiSelector,
  } = deps;

  // Reuse cached scene data by map url to keep per-floor runtime state.
  let scene = state.sceneCache[mapUrl];
  if (!scene) {
    const map = await loadTmjMap(mapUrl);
    const blocked = buildBlockedGrid(map);
    scene = {
      map,
      blocked,
      doorSystem: buildDoorSystem(map),
      screenSystem: buildScreenSystem(map),
      serverSystem: buildServerSystem(map),
      tradingScreenSystem: buildTradingScreenSystem(map),
    };
    state.sceneCache[mapUrl] = scene;
  }

  const { map, blocked } = scene;

  state.map = scene.map;
  state.blocked = scene.blocked;
  state.currentMapUrl = mapUrl;
  state.doorSystem = scene.doorSystem;
  state.screenSystem = scene.screenSystem;
  state.serverSystem = scene.serverSystem;
  state.tradingScreenSystem = scene.tradingScreenSystem;

  if (!state.actors.length) {
    state.actors = createActors({
      map,
      blocked,
      currentMapUrl: state.currentMapUrl,
      isWalkable,
      tileToWorldCenter,
    });
    state.selectedActorId = state.actors[0]?.id || null;
    state.commandActorId = state.actors[0]?.id || null;
  }

  // Keep role selectors synchronized whenever scene state is loaded.
  setupRoleSelector();
  if (typeof setupCommandRoleSelector === "function") setupCommandRoleSelector();

  if (spawnLayerName) {
    let spawn = null;
    if (spawnLayerName === "__center__") {
      spawn = { x: Math.floor(map.width / 2), y: Math.floor(map.height / 2) };
    } else {
      spawn = findFirstTileInLayer(map, spawnLayerName);
    }

    if (spawn) {
      const targets = transferActorId ? state.actors.filter((a) => a.id === transferActorId) : state.actors;
      for (let i = 0; i < targets.length; i += 1) {
        const actor = targets[i];
        const px = spawn.x + spawnOffset.x + (i % 2 === 0 ? 0 : 1);
        const py = spawn.y + spawnOffset.y + (i > 1 ? 1 : 0);
        const rough = { x: px, y: py };
        const safe = isWalkable(map, blocked, rough.x, rough.y)
          ? rough
          : (findNearestWalkableGoal(map, blocked, rough, rough, 20) || spawn);
        const center = tileToWorldCenter(map, safe.x, safe.y);
        actor.x = center.x;
        actor.y = center.y;
        actor.mapUrl = mapUrl;
        actor.path = [];
        actor.sitTask = null;
        actor.isSitting = false;
        actor.seatedChair = null;
        actor.screenAnimOn = false;
        actor.activeScreenGroupId = null;
        actor.activeTradingScreenGroupId = null;
      }
    }
  }

  setupPoiSelector();
}
