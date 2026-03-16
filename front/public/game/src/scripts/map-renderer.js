function resolveTileset(tilesets, gid) {
  if (!gid) return null;
  for (let i = tilesets.length - 1; i >= 0; i -= 1) {
    if (gid >= tilesets[i].firstgid) return tilesets[i];
  }
  return null;
}

function drawTile(ctx, gid, x, y, map) {
  if (!gid) return;
  const ts = resolveTileset(map.tilesets, gid);
  if (!ts) return;

  const localId = gid - ts.firstgid;
  const sx = (localId % ts.columns) * ts.tilewidth;
  const sy = Math.floor(localId / ts.columns) * ts.tileheight;

  if (ts.image) {
    ctx.drawImage(ts.image, sx, sy, ts.tilewidth, ts.tileheight, x, y, map.tileWidth, map.tileHeight);
    return;
  }

  const hue = ((localId * 31) % 360 + 360) % 360;
  ctx.fillStyle = `hsl(${hue} 50% 35%)`;
  ctx.fillRect(x, y, map.tileWidth, map.tileHeight);
}

function drawPath(ctx, path, map) {
  if (!path.length) return;
  ctx.fillStyle = "rgba(80, 227, 194, 0.45)";
  for (const step of path) {
    ctx.fillRect(step.x * map.tileWidth + 9, step.y * map.tileHeight + 9, map.tileWidth - 18, map.tileHeight - 18);
  }
}

function drawSeatedChairOverlay(ctx, map, actor) {
  if (!actor.isSitting || !actor.seatedChair) return;
  const chairLayerName = actor.seatedChair.layerName;
  const chairLayer = chairLayerName ? map.layers.find((l) => l.name === chairLayerName) : null;
  if (!chairLayer) return;

  const tiles = actor.seatedChair.tiles || [actor.seatedChair];
  for (const t of tiles) {
    const tx = t.x;
    const ty = t.y;
    if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) continue;
    const gid = chairLayer.data[ty * map.width + tx] || 0;
    if (!gid) continue;
    drawTile(ctx, gid, tx * map.tileWidth, ty * map.tileHeight, map);
  }
}

function getMapScreenOffset(map, viewWidth, viewHeight) {
  const mapPixelWidth = map.width * map.tileWidth;
  const mapPixelHeight = map.height * map.tileHeight;
  return {
    x: Math.max(0, (viewWidth - mapPixelWidth) / 2),
    y: Math.max(0, (viewHeight - mapPixelHeight) / 2),
  };
}

export function renderMapScene(ctx, options) {
  const {
    map,
    camera,
    actorsOnMap,
    selectedActorId,
    roleSprites,
    roleTemplateDirRow,
    drawActor,
    remapGid,
    viewport,
  } = options;
  if (!map) return;

  const selected = actorsOnMap.find((a) => a.id === selectedActorId) || actorsOnMap[0] || null;
  let actorsDrawn = false;
  const viewWidth = viewport?.width || ctx.canvas.clientWidth || window.innerWidth;
  const viewHeight = viewport?.height || ctx.canvas.clientHeight || window.innerHeight;
  const screenOffset = getMapScreenOffset(map, viewWidth, viewHeight);

  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, viewWidth, viewHeight);
  ctx.save();
  ctx.translate(screenOffset.x - camera.x, screenOffset.y - camera.y);

  for (const layer of map.layers) {
    for (let y = 0; y < layer.height; y += 1) {
      for (let x = 0; x < layer.width; x += 1) {
        const tileIndex = y * layer.width + x;
        let gid = layer.data[tileIndex];
        if (!gid) continue;
        gid = remapGid(layer, gid, tileIndex);
        drawTile(ctx, gid, x * map.tileWidth, y * map.tileHeight, map);
      }
    }

    if (layer.name.toLowerCase() === "door") {
      if (selected) drawPath(ctx, selected.path, map);
      for (const actor of actorsOnMap) drawActor(ctx, actor, map, roleSprites, roleTemplateDirRow);
      for (const actor of actorsOnMap) drawSeatedChairOverlay(ctx, map, actor);
      actorsDrawn = true;
    }
  }

  if (!actorsDrawn) {
    if (selected) drawPath(ctx, selected.path, map);
    for (const actor of actorsOnMap) drawActor(ctx, actor, map, roleSprites, roleTemplateDirRow);
    for (const actor of actorsOnMap) drawSeatedChairOverlay(ctx, map, actor);
  }

  ctx.restore();
}
