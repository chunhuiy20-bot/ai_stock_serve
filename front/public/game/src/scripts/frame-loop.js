/*
 * 模块职责
 * - 提供通用帧循环创建器，统一 dt 计算与帧调度。
 *
 * 运行/调用顺序
 * 1. main 调用 createFrameLoop({ update, render }) 得到 frame。
 * 2. 启动阶段通过 requestAnimationFrame(frame) 开始循环。
 *
 * 函数概述
 * - createFrameLoop(context): 生成并返回 frame(ts) 循环函数。
 */

export function createFrameLoop({
  update,
  render,
  requestNextFrame = requestAnimationFrame,
  maxDt = 0.033,
}) {
  let lastTs = 0;

  function frame(ts) {
    const dt = Math.min(maxDt, (ts - lastTs) / 1000 || 0);
    lastTs = ts;
    update(dt);
    render();
    requestNextFrame(frame);
  }

  return frame;
}
