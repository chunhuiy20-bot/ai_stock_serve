/*
 * 模块职责
 * - 负责角色动画状态与角色精灵绘制。
 *
 * 运行/调用顺序
 * 1. updateActorWalkAnimation() 在运行时每帧先更新 moving 与 walkTime。
 * 2. drawActor() 在渲染阶段按方向/帧号绘制角色。
 *
 * 函数概述
 * - updateActorWalkAnimation(actor, moving, dt): 更新行走动画时间轴。
 * - drawActor(ctx, actor, map, roleSprites, defaultDirRow): 绘制角色或降级占位图形。
 */

const DEFAULT_DIR_ROW = { down: 0, left: 1, right: 2, up: 3 };

function getCurrentRoleSprite(actor, roleSprites) {
  const role = roleSprites[actor.roleKey];
  if (role?.img) return role;
  const fallback = roleSprites.default;
  return fallback?.img ? fallback : null;
}

function drawFallbackPlayer(ctx, actor, map) {
  const r = map.tileWidth * 0.28;
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(actor.x, actor.y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function updateActorWalkAnimation(actor, moving, dt) {
  actor.moving = moving;
  actor.walkTime = moving ? actor.walkTime + dt : 0;
}

export function drawActor(ctx, actor, map, roleSprites, defaultDirRow = DEFAULT_DIR_ROW) {
  const role = getCurrentRoleSprite(actor, roleSprites);
  if (!role) return drawFallbackPlayer(ctx, actor, map);

  const sprite = role.img;
  const rows = role.rows;
  const cols = role.cols;
  const frameW = Math.floor(sprite.width / cols);
  const frameH = Math.floor(sprite.height / rows);
  const dirRow = role.dirRow || defaultDirRow;
  const row = dirRow[actor.dir] ?? 0;
  const frame = actor.moving ? Math.floor(actor.walkTime * 10) % cols : 0;
  const sx = frame * frameW;
  const sy = row * frameH;

  const scale = map.tileWidth / 32;
  const dw = Math.round(frameW * scale);
  const dh = Math.round(frameH * scale);

  let anchorX = actor.x;
  let anchorY = actor.y;
  if (actor.isSitting && actor.seatedChair) {
    const seatX = (actor.seatedChair.sitPoint?.x ?? actor.seatedChair.center?.x ?? actor.seatedChair.x) * map.tileWidth + map.tileWidth / 2;
    const seatY = (actor.seatedChair.sitPoint?.y ?? actor.seatedChair.center?.y ?? actor.seatedChair.y) * map.tileHeight + map.tileHeight / 2;
    anchorX = seatX;
    anchorY = seatY + map.tileHeight * 0.08;
  }

  const dx = Math.round(anchorX - dw / 2);
  const dy = Math.round(anchorY - dh + map.tileHeight * 0.5);
  ctx.drawImage(sprite, sx, sy, frameW, frameH, dx, dy, dw, dh);
}
