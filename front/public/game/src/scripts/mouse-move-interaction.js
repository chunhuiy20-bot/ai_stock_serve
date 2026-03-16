function getMapScreenOffset(map, canvas) {
  const viewWidth = canvas.clientWidth || canvas.width;
  const viewHeight = canvas.clientHeight || canvas.height;
  const mapPixelWidth = map.width * map.tileWidth;
  const mapPixelHeight = map.height * map.tileHeight;
  return {
    x: Math.max(0, (viewWidth - mapPixelWidth) / 2),
    y: Math.max(0, (viewHeight - mapPixelHeight) / 2),
  };
}

export function bindCanvasClickMovement({
  canvas,
  getSelectedActor,
  getMap,
  getCamera,
  worldToTile,
  dispatchMoveCommand,
}) {
  if (!canvas) return;

  canvas.addEventListener("click", (e) => {
    const actor = getSelectedActor();
    const map = getMap();
    if (!actor || !map) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const camera = getCamera();
    const screenOffset = getMapScreenOffset(map, canvas);
    const localX = ((e.clientX - rect.left) / rect.width) * canvas.clientWidth;
    const localY = ((e.clientY - rect.top) / rect.height) * canvas.clientHeight;
    const worldX = localX - screenOffset.x + camera.x;
    const worldY = localY - screenOffset.y + camera.y;
    const rawGoal = { ...worldToTile(map, worldX, worldY), source: "canvas", mapUrl: actor.mapUrl };
    dispatchMoveCommand(actor, rawGoal);
  });
}
