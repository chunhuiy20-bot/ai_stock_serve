/*
 * 模块职责
 * - 定义应用级状态对象与相机对象的初始化方式。
 *
 * 运行/调用顺序
 * 1. main 导入 camera 与 createAppState()。
 * 2. main 创建全局 state 并在运行期间持续修改。
 *
 * 导出概述
 * - camera: 全局相机对象。
 * - createAppState(initialMapUrl): 创建初始 state 结构（含 sceneCache）。
 */

export const camera = { x: 0, y: 0 };

export function createAppState(initialMapUrl) {
  return {
    map: null,
    actors: [],
    selectedActorId: null,
    commandActorId: null,
    blocked: null,
    roleSprites: {},
    roleSpriteMissing: false,
    doorSystem: null,
    screenSystem: null,
    serverSystem: null,
    tradingScreenSystem: null,
    currentMapUrl: initialMapUrl,
    sceneChanging: false,
    lastSceneSwitchAt: 0,
    globalAnimTime: 0,
    sceneCache: {},
  };
}
