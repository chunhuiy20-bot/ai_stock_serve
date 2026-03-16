/*
 * 模块职责
 * - 负责角色选择相关查询与角色选择器 UI 逻辑。
 *
 * 运行/调用顺序
 * 1. main 通过 get / set 函数读写当前选中角色。
 * 2. setupRoleSelector() 在场景初始化后构建下拉菜单。
 *
 * 函数概述
 * - getActorById(state, id): 通过 id 查找角色。
 * - getSelectedActor(state): 获取当前选中角色。
 * - getActorsOnCurrentMap(state): 获取当前楼层角色。
 * - setSelectedActor(context): 切换选中角色并按需切场。
 * - setupRoleSelector(context): 初始化角色选择下拉框。
 */

export function getActorById(state, id) {
  return state.actors.find((a) => a.id === id) || null;
}

export function getSelectedActor(state) {
  return getActorById(state, state.selectedActorId) || state.actors[0] || null;
}

export function getActorsOnCurrentMap(state) {
  return state.actors.filter((a) => a.mapUrl === state.currentMapUrl);
}

export function setSelectedActor({
  state,
  id,
  loadScene,
  setStatus,
}) {
  const actor = getActorById(state, id);
  if (!actor) return;
  state.selectedActorId = id;
  if (actor.mapUrl && actor.mapUrl !== state.currentMapUrl) {
    loadScene(actor.mapUrl).catch((err) => {
      console.error(err);
      setStatus(`Load failed: ${err.message}`);
    });
  }
}

export function setupRoleSelector({
  state,
  roleSelectEl,
  onChangeActorId,
}) {
  if (!roleSelectEl) return;
  roleSelectEl.innerHTML = "";
  for (const actor of state.actors) {
    const opt = document.createElement("option");
    opt.value = actor.id;
    opt.textContent = actor.name;
    roleSelectEl.appendChild(opt);
  }
  roleSelectEl.value = state.selectedActorId || state.actors[0]?.id || "";
  roleSelectEl.onchange = () => onChangeActorId(roleSelectEl.value);
}
