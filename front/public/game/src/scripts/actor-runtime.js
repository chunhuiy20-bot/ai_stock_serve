function updateActorRuntime({
  actor,
  map,
  dt,
  tileToWorldCenter,
  worldToTile,
  updateActorWalkAnimation,
}) {
  let moving = false;

  if (actor.path.length) {
    const nextStep = actor.path[0];
    const target = tileToWorldCenter(map, nextStep.x, nextStep.y);
    const vx = target.x - actor.x;
    const vy = target.y - actor.y;
    const dist = Math.hypot(vx, vy);

    if (dist <= actor.speed * dt) {
      actor.x = target.x;
      actor.y = target.y;
      actor.path.shift();
      moving = true;
    } else {
      actor.x += (vx / dist) * actor.speed * dt;
      actor.y += (vy / dist) * actor.speed * dt;
      moving = true;
    }

    if (Math.abs(vx) > Math.abs(vy)) actor.dir = vx > 0 ? "right" : "left";
    else actor.dir = vy > 0 ? "down" : "up";
  }

  updateActorWalkAnimation(actor, moving, dt);

  if (!moving && actor.sitTask && actor.path.length === 0) {
    const pt = worldToTile(map, actor.x, actor.y);
    if (pt.x === actor.sitTask.goal.x && pt.y === actor.sitTask.goal.y) {
      actor.isSitting = true;
      actor.screenAnimOn = true;
      actor.screenAnimTime = 0;
      actor.activeScreenGroupId = actor.sitTask.screenGroupId ?? null;
      actor.activeTradingScreenGroupId = actor.sitTask.tradingScreenGroupId ?? null;
      actor.seatedChair = actor.sitTask.chair;
      actor.dir = "up";
      actor.sitTask = null;
    }
  }

  if (actor.screenAnimOn) actor.screenAnimTime += dt;
}

export function updateRuntime({
  dt,
  state,
  camera,
  getMapByUrl,
  getBlockedByUrl,
  ensureSceneCached,
  getActorsOnCurrentMap,
  getSelectedActor,
  tileToWorldCenter,
  worldToTile,
  updateActorWalkAnimation,
  updateDoors,
  handleStairsTransition,
  issueDeferredMoveCommand,
  loadScene,
  findLayerByName,
  findFirstTileInLayer,
  isTileInLayer,
  isWalkable,
  findNearestWalkableGoal,
  mapFloor1Url,
  mapFloor2Url,
  mapWorldUrl,
  getViewportSize,
}) {
  const currentMap = state.map;
  const actorsOnCurrentMap = getActorsOnCurrentMap();
  if (!currentMap || !state.actors.length) return;

  for (const actor of state.actors) {
    const actorMap = getMapByUrl(actor.mapUrl);
    if (!actorMap) continue;
    updateActorRuntime({
      actor,
      map: actorMap,
      dt,
      tileToWorldCenter,
      worldToTile,
      updateActorWalkAnimation,
    });
  }

  state.globalAnimTime += dt;
  updateDoors(state.doorSystem, actorsOnCurrentMap, currentMap, dt);
  handleStairsTransition({
    state,
    getSelectedActor,
    loadScene,
    issueDeferredMoveCommand,
    getMapByUrl,
    getBlockedByUrl,
    ensureSceneCached,
    worldToTile,
    findLayerByName,
    findFirstTileInLayer,
    isTileInLayer,
    isWalkable,
    findNearestWalkableGoal,
    tileToWorldCenter,
    mapFloor1Url,
    mapFloor2Url,
    mapWorldUrl,
  });

  const focus = actorsOnCurrentMap.find((a) => a.id === state.selectedActorId) || actorsOnCurrentMap[0];
  if (!focus) return;

  const viewport = typeof getViewportSize === "function"
    ? getViewportSize()
    : { width: window.innerWidth, height: window.innerHeight };
  const maxCameraX = Math.max(0, currentMap.width * currentMap.tileWidth - viewport.width);
  const maxCameraY = Math.max(0, currentMap.height * currentMap.tileHeight - viewport.height);

  camera.x = focus.x - viewport.width / 2;
  camera.y = focus.y - viewport.height / 2;
  camera.x = Math.max(0, Math.min(camera.x, maxCameraX));
  camera.y = Math.max(0, Math.min(camera.y, maxCameraY));
}
