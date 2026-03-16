/*
 * 模块职责
 * - 提供地图坐标/图层相关的通用工具函数。
 *
 * 运行/调用顺序
 * - 被场景加载、运行时、楼梯交互、鼠标交互等模块复用。
 *
 * 函数概述
 * - findLayerByName(map, layerName): 按名称查图层。
 * - findFirstTileInLayer(map, layerName): 查图层首个占用 tile。
 * - worldToTile(map, x, y): 世界坐标转 tile 坐标。
 * - tileToWorldCenter(map, tx, ty): tile 坐标转世界中心点。
 * - isTileInLayer(layer, map, tx, ty): 判断坐标是否命中图层。
 */

export function findLayerByName(map, layerName) {
  return map.layers.find((l) => l.name.toLowerCase() === layerName.toLowerCase()) || null;
}

export function findFirstTileInLayer(map, layerName) {
  const layer = findLayerByName(map, layerName);
  if (!layer) return null;
  for (let i = 0; i < layer.data.length; i += 1) {
    if ((layer.data[i] || 0) > 0) {
      return { x: i % map.width, y: Math.floor(i / map.width) };
    }
  }
  return null;
}

export function worldToTile(map, x, y) {
  return { x: Math.floor(x / map.tileWidth), y: Math.floor(y / map.tileHeight) };
}

export function tileToWorldCenter(map, tx, ty) {
  return { x: tx * map.tileWidth + map.tileWidth / 2, y: ty * map.tileHeight + map.tileHeight / 2 };
}

export function isTileInLayer(layer, map, tx, ty) {
  if (!layer) return false;
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return false;
  return (layer.data[ty * map.width + tx] || 0) > 0;
}
