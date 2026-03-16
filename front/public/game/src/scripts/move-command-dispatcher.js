function findLayerByName(map, layerName) {
  if (!map || !layerName) return null;
  return map.layers.find((l) => l.name.toLowerCase() === layerName.toLowerCase()) || null;
}

function findNearestMarkedTile(map, layerName, fromTile) {
  const layer = findLayerByName(map, layerName);
  if (!layer) return null;
  let best = null;
  let bestDist = Infinity;

  for (let i = 0; i < layer.data.length; i += 1) {
    if ((layer.data[i] || 0) <= 0) continue;
    const x = i % map.width;
    const y = Math.floor(i / map.width);
    const d = Math.abs(x - fromTile.x) + Math.abs(y - fromTile.y);
    if (d < bestDist) {
      bestDist = d;
      best = { x, y };
    }
  }
  return best;
}

function buildMapGraph(mapFloor1Url, mapFloor2Url, mapWorldUrl) {
  const g = new Map();
  g.set(mapFloor1Url, [mapFloor2Url, mapWorldUrl].filter(Boolean));
  g.set(mapFloor2Url, [mapFloor1Url].filter(Boolean));
  g.set(mapWorldUrl, [mapFloor1Url].filter(Boolean));
  return g;
}

function findNextHopMap(fromMapUrl, toMapUrl, mapFloor1Url, mapFloor2Url, mapWorldUrl) {
  if (!fromMapUrl || !toMapUrl || fromMapUrl === toMapUrl) return null;
  const graph = buildMapGraph(mapFloor1Url, mapFloor2Url, mapWorldUrl);
  if (!graph.has(fromMapUrl) || !graph.has(toMapUrl)) return null;

  const queue = [fromMapUrl];
  const prev = new Map([[fromMapUrl, null]]);

  while (queue.length) {
    const cur = queue.shift();
    if (cur === toMapUrl) break;
    const neighbors = graph.get(cur) || [];
    for (const n of neighbors) {
      if (prev.has(n)) continue;
      prev.set(n, cur);
      queue.push(n);
    }
  }

  if (!prev.has(toMapUrl)) return null;

  let step = toMapUrl;
  while (prev.get(step) && prev.get(step) !== fromMapUrl) {
    step = prev.get(step);
  }
  return step;
}

function findTransferTileForHop(map, actorMapUrl, nextMapUrl, fromTile, mapFloor1Url, mapFloor2Url, mapWorldUrl) {
  if (actorMapUrl === mapFloor1Url && nextMapUrl === mapFloor2Url) return { x: 29, y: 11 };
  if (actorMapUrl === mapFloor2Url && nextMapUrl === mapFloor1Url) return { x: 29, y: 10 };
  if (actorMapUrl === mapFloor1Url && nextMapUrl === mapWorldUrl) return { x: 1, y: 16 };

  if (actorMapUrl === mapWorldUrl && nextMapUrl === mapFloor1Url) {
    return findNearestMarkedTile(map, "stock_exchange", fromTile)
      || findNearestMarkedTile(map, "to_floor1_point", fromTile)
      || findNearestMarkedTile(map, "to_floor1_points", fromTile);
  }

  const markerLayerNames = actorMapUrl === mapFloor1Url
    ? ["to_floor2_points", "to_floor2_point", "stairs_to_floor2"]
    : ["to_floor1_points", "to_floor1_point", "stairs_to_floor1"];

  for (const layerName of markerLayerNames) {
    const tile = findNearestMarkedTile(map, layerName, fromTile);
    if (tile) return tile;
  }
  return null;
}

export function dispatchActorMoveCommand({
  actor,
  rawGoal,
  state,
  issueMoveCommand,
  getMapByUrl,
  getBlockedByUrl,
  getSceneByUrl,
  findFirstTileInLayer,
  mapFloor1Url,
  mapFloor2Url,
  mapWorldUrl,
  worldToTile,
  findNearestWalkableGoal,
  findPath,
}) {
  if (!actor || !rawGoal) return;

  const actorMapUrl = actor.mapUrl || state.currentMapUrl;
  const actorMap = getMapByUrl(actorMapUrl);
  const actorBlocked = getBlockedByUrl(actorMapUrl);
  if (!actorMap || !actorBlocked) return;

  const startTile = worldToTile(actorMap, actor.x, actor.y);
  let goal = rawGoal;
  const targetMapUrl = rawGoal.mapUrl || actorMapUrl;

  if (targetMapUrl !== actorMapUrl) {
    actor.deferredMoveGoal = {
      x: rawGoal.x,
      y: rawGoal.y,
      mapUrl: targetMapUrl,
      source: rawGoal.source,
      requestId: rawGoal.requestId,
    };

    const nextHopMapUrl = findNextHopMap(
      actorMapUrl,
      targetMapUrl,
      mapFloor1Url,
      mapFloor2Url,
      mapWorldUrl
    );
    if (!nextHopMapUrl) return;

    const transferTile = findTransferTileForHop(
      actorMap,
      actorMapUrl,
      nextHopMapUrl,
      startTile,
      mapFloor1Url,
      mapFloor2Url,
      mapWorldUrl
    ) || findFirstTileInLayer(actorMap, actorMapUrl === mapFloor1Url ? "stairs_to_floor2" : "stairs_to_floor1");
    if (!transferTile) return;

    console.debug("[move-dispatch] cross-map", {
      actorId: actor.id,
      fromMap: actorMapUrl,
      toMap: targetMapUrl,
      nextHopMap: nextHopMapUrl,
      transferTile,
    });

    goal = { x: transferTile.x, y: transferTile.y, mapUrl: actorMapUrl };
  } else {
    actor.deferredMoveGoal = null;
    console.debug("[move-dispatch] same-map", {
      actorId: actor.id,
      map: actorMapUrl,
      goal: { x: goal.x, y: goal.y },
    });
  }

  const scene = getSceneByUrl(actorMapUrl);
  issueMoveCommand(actor, goal, {
    map: actorMap,
    blocked: actorBlocked,
    worldToTile,
    findNearestWalkableGoal,
    findPath,
    screenGroups: scene?.screenSystem?.groups || [],
    tradingScreenGroups: scene?.tradingScreenSystem?.groups || [],
  });
}
