function resetActorInteractionState(actor) {
  actor.path = [];
  actor.sitTask = null;
  actor.isSitting = false;
  actor.seatedChair = null;
  actor.screenAnimOn = false;
  actor.activeScreenGroupId = null;
  actor.activeTradingScreenGroupId = null;
}

function maybeDispatchDeferredGoal(actor, issueDeferredMoveCommand) {
  const deferred = actor.deferredMoveGoal;
  if (!deferred) return;
  // Continue routing after every map transition until target map is reached.
  issueDeferredMoveCommand(actor, deferred);
}

function isWorldMapExitTile(tile) {
  if (!tile) return false;
  return (tile.x === 0 || tile.x === 1) && (tile.y === 15 || tile.y === 16);
}

function findLayerBounds(map, layerName, findLayerByName) {
  const layer = findLayerByName(map, layerName);
  if (!layer) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let found = false;

  for (let i = 0; i < layer.data.length; i += 1) {
    if ((layer.data[i] || 0) <= 0) continue;
    const x = i % map.width;
    const y = Math.floor(i / map.width);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    found = true;
  }

  if (!found) return null;
  return { minX, minY, maxX, maxY };
}

function resolveStairsSpawnTile(map, layerName, side, findLayerByName, findFirstTileInLayer) {
  const bounds = findLayerBounds(map, layerName, findLayerByName);
  if (bounds) {
    const centerX = Math.round((bounds.minX + bounds.maxX) / 2);
    return side === "back"
      ? { x: centerX, y: bounds.minY - 2 }
      : { x: centerX, y: bounds.maxY + 2 };
  }
  return findFirstTileInLayer(map, layerName);
}

function relocateActorToMap({
  actor,
  toMapUrl,
  spawnLayerName,
  fixedTile = null,
  stairsArrivalSide = "front",
  spawnOffset,
  getMapByUrl,
  getBlockedByUrl,
  findLayerByName,
  findFirstTileInLayer,
  isWalkable,
  findNearestWalkableGoal,
  tileToWorldCenter,
}) {
  const map = getMapByUrl(toMapUrl);
  const blocked = getBlockedByUrl(toMapUrl);
  if (!map || !blocked) return false;

  const spawn = fixedTile
    ? fixedTile
    : (spawnLayerName === "__center__"
      ? { x: Math.floor(map.width / 2), y: Math.floor(map.height / 2) }
      : resolveStairsSpawnTile(map, spawnLayerName, stairsArrivalSide, findLayerByName, findFirstTileInLayer));
  if (!spawn) return false;

  const rough = { x: spawn.x + spawnOffset.x, y: spawn.y + spawnOffset.y };
  const safe = isWalkable(map, blocked, rough.x, rough.y)
    ? rough
    : (findNearestWalkableGoal(map, blocked, rough, rough, 20) || spawn);
  const center = tileToWorldCenter(map, safe.x, safe.y);
  actor.x = center.x;
  actor.y = center.y;
  actor.mapUrl = toMapUrl;
  resetActorInteractionState(actor);
  return true;
}

function moveActorAcrossMap({
  actor,
  toMapUrl,
  spawnLayerName,
  fixedTile = null,
  stairsArrivalSide = "front",
  spawnOffset,
  isSelectedVisibleActor,
  canSwitchVisibleScene,
  state,
  now,
  nowFn,
  loadScene,
  issueDeferredMoveCommand,
  ensureSceneCached,
  getMapByUrl,
  getBlockedByUrl,
  findLayerByName,
  findFirstTileInLayer,
  isWalkable,
  findNearestWalkableGoal,
  tileToWorldCenter,
}) {
  if (isSelectedVisibleActor && canSwitchVisibleScene) {
    actor.lastStairsTransitionAt = now;
    actor.pendingStairsTransfer = true;
    state.sceneChanging = true;
    loadScene(toMapUrl)
      .then(() => relocateActorToMap({
        actor,
        toMapUrl,
        spawnLayerName,
        fixedTile,
        stairsArrivalSide,
        spawnOffset,
        getMapByUrl,
        getBlockedByUrl,
        findLayerByName,
        findFirstTileInLayer,
        isWalkable,
        findNearestWalkableGoal,
        tileToWorldCenter,
      }))
      .then(() => maybeDispatchDeferredGoal(actor, issueDeferredMoveCommand))
      .finally(() => {
        state.sceneChanging = false;
        state.lastSceneSwitchAt = nowFn();
        actor.lastStairsTransitionAt = state.lastSceneSwitchAt;
        actor.pendingStairsTransfer = false;
      });
    return true;
  }

  if (actor.pendingStairsTransfer) return true;
  actor.pendingStairsTransfer = true;

  const moved = relocateActorToMap({
    actor,
    toMapUrl,
    spawnLayerName,
    fixedTile,
    stairsArrivalSide,
    spawnOffset,
    getMapByUrl,
    getBlockedByUrl,
    findLayerByName,
    findFirstTileInLayer,
    isWalkable,
    findNearestWalkableGoal,
    tileToWorldCenter,
  }) || false;

  if (moved) {
    actor.lastStairsTransitionAt = now;
    actor.pendingStairsTransfer = false;
    maybeDispatchDeferredGoal(actor, issueDeferredMoveCommand);
    return true;
  }

  Promise.resolve(ensureSceneCached(toMapUrl))
    .then(() => {
      const ok = relocateActorToMap({
        actor,
        toMapUrl,
        spawnLayerName,
        fixedTile,
        stairsArrivalSide,
        spawnOffset,
        getMapByUrl,
        getBlockedByUrl,
        findLayerByName,
        findFirstTileInLayer,
        isWalkable,
        findNearestWalkableGoal,
        tileToWorldCenter,
      });
      if (ok) actor.lastStairsTransitionAt = nowFn();
      if (ok) maybeDispatchDeferredGoal(actor, issueDeferredMoveCommand);
    })
    .finally(() => {
      actor.pendingStairsTransfer = false;
    });

  return true;
}

export function maybeTriggerStairsTransition({
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
  nowFn = Date.now,
}) {
  if (!state.actors.length) return;
  if (state.sceneChanging) return;

  const now = nowFn();
  const selectedActor = getSelectedActor();
  const selectedId = selectedActor?.id || null;
  const canSwitchVisibleScene = now - state.lastSceneSwitchAt >= 500;

  for (const actor of state.actors) {
    if (now - (actor.lastStairsTransitionAt || 0) < 500) continue;

    const actorMap = getMapByUrl(actor.mapUrl);
    if (!actorMap) continue;
    const at = worldToTile(actorMap, actor.x, actor.y);
    const isSelectedVisibleActor = actor.id === selectedId && actor.mapUrl === state.currentMapUrl;


    if (actor.mapUrl === mapWorldUrl) {
      const stockExchange = findLayerByName(actorMap, "stock_exchange");
      if (stockExchange && isTileInLayer(stockExchange, actorMap, at.x, at.y)) {
        const handled = moveActorAcrossMap({
          actor,
          toMapUrl: mapFloor1Url,
          spawnLayerName: null,
          fixedTile: { x: 3, y: 15 },
          fixedTile: { x: 1, y: 17 },
        spawnOffset: { x: 0, y: 0 },
          isSelectedVisibleActor,
          canSwitchVisibleScene,
          state,
          now,
          nowFn,
          loadScene,
          issueDeferredMoveCommand,
          ensureSceneCached,
          getMapByUrl,
          getBlockedByUrl,
          findLayerByName,
          findFirstTileInLayer,
          isWalkable,
          findNearestWalkableGoal,
          tileToWorldCenter,
        });
        if (handled) return;
      }
    }
    if (actor.mapUrl === mapFloor1Url && mapWorldUrl && isWorldMapExitTile(at)) {
      const handled = moveActorAcrossMap({
        actor,
        toMapUrl: mapWorldUrl,
        spawnLayerName: null,
        fixedTile: { x: 1, y: 17 },
        spawnOffset: { x: 0, y: 0 },
        isSelectedVisibleActor,
        canSwitchVisibleScene,
        state,
        now,
        nowFn,
        loadScene,
        issueDeferredMoveCommand,
        ensureSceneCached,
        getMapByUrl,
        getBlockedByUrl,
        findLayerByName,
        findFirstTileInLayer,
        isWalkable,
        findNearestWalkableGoal,
        tileToWorldCenter,
      });
      if (handled) return;
    }

    if (actor.mapUrl === mapFloor1Url) {
      const up = findLayerByName(actorMap, "stairs_to_floor2");
      if (!up || !isTileInLayer(up, actorMap, at.x, at.y)) continue;

      const handled = moveActorAcrossMap({
        actor,
        toMapUrl: mapFloor2Url,
        spawnLayerName: null,
        fixedTile: { x: 30, y: 9 },
        spawnOffset: { x: 0, y: 0 },
        isSelectedVisibleActor,
        canSwitchVisibleScene,
        state,
        now,
        nowFn,
        loadScene,
        issueDeferredMoveCommand,
        ensureSceneCached,
        getMapByUrl,
        getBlockedByUrl,
        findLayerByName,
        findFirstTileInLayer,
        isWalkable,
        findNearestWalkableGoal,
        tileToWorldCenter,
      });
      if (handled) return;
      continue;
    }

    if (actor.mapUrl === mapFloor2Url) {
      const down = findLayerByName(actorMap, "stairs_to_floor1");
      if (!down || !isTileInLayer(down, actorMap, at.x, at.y)) continue;

      const handled = moveActorAcrossMap({
        actor,
        toMapUrl: mapFloor1Url,
        spawnLayerName: null,
        fixedTile: { x: 30, y: 13 },
        spawnOffset: { x: 0, y: 0 },
        isSelectedVisibleActor,
        canSwitchVisibleScene,
        state,
        now,
        nowFn,
        loadScene,
        issueDeferredMoveCommand,
        ensureSceneCached,
        getMapByUrl,
        getBlockedByUrl,
        findLayerByName,
        findFirstTileInLayer,
        isWalkable,
        findNearestWalkableGoal,
        tileToWorldCenter,
      });
      if (handled) return;
    }
  }
}








