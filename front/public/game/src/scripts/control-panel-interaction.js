/*
 * 妯″潡鑱岃矗
 * - 璐熻矗 control-panel 鐨?POI 鍒楄〃娓叉煋涓庢寜閽?杈撳叆妗嗕簨浠剁粦瀹氥€?
 *
 * 杩愯/璋冪敤椤哄簭
 * 1. 鍦烘櫙鍔犺浇鍚庤皟鐢?setupPoiSelector() 鍒锋柊 POI銆?
 * 2. 鍒濆鍖栭樁娈佃皟鐢?bindMapViewSelector()/bindControlPanelMovementHandlers() 缁戝畾浜や簰銆?
 *
 * 鍑芥暟姒傝堪
 * - bindMapViewSelector(context): 缁戝畾涓婂笣瑙嗚鍦板浘鍒囨崲涓嬫媺妗嗐€?
 * - setupPoiSelector(poiSelectEl, screenGroups, tradingScreenGroups): 娓叉煋 POI 涓嬫媺銆?
 * - bindControlPanelMovementHandlers(context): 缁戝畾鍧愭爣璺宠浆涓?POI 璺宠浆浜嬩欢銆?
 */

export function bindMapViewSelector({
  viewMapSelectEl,
  getCurrentMapUrl,
  mapFloor1Url,
  mapFloor2Url,
  mapWorldUrl,
  onChangeMapUrl,
  setStatus,
}) {
  if (!viewMapSelectEl) return;

  const resolveMapUrl = (url) => {
    const raw = String(url || "").toLowerCase();
    if (raw === String(mapFloor1Url || "").toLowerCase()) return mapFloor1Url;
    if (raw === String(mapFloor2Url || "").toLowerCase()) return mapFloor2Url;
    if (mapWorldUrl && raw === String(mapWorldUrl).toLowerCase()) return mapWorldUrl;
    return null;
  };

  viewMapSelectEl.value = resolveMapUrl(getCurrentMapUrl?.()) || mapFloor1Url;
  viewMapSelectEl.onchange = async () => {
    const target = resolveMapUrl(viewMapSelectEl.value);
    if (!target) return;
    try {
      await onChangeMapUrl?.(target);
    } catch (err) {
      console.error(err);
      if (typeof setStatus === "function") setStatus(`Load failed: ${err.message}`);
    }
  };
}

export function setupPoiSelector(poiSelectEl, screenGroups = [], tradingScreenGroups = []) {
  if (!poiSelectEl) return;
  poiSelectEl.innerHTML = "";

  const all = [];

  screenGroups.forEach((g, i) => {
    all.push({
      label: "Risk Monitor " + (i + 1),
      x: Math.round(g.center.x),
      y: Math.round(g.center.y),
    });
  });

  tradingScreenGroups.forEach((g, i) => {
    all.push({
      label: "Trading PC " + (i + 1),
      x: Math.round(g.center.x),
      y: Math.round(g.center.y),
    });
  });

  for (let i = 0; i < all.length; i += 1) {
    const p = all[i];
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = p.label + " (" + p.x + ", " + p.y + ")";
    opt.dataset.x = String(p.x);
    opt.dataset.y = String(p.y);
    poiSelectEl.appendChild(opt);
  }

  if (poiSelectEl.options.length > 0) {
    poiSelectEl.selectedIndex = 0;
  }
}

export function bindControlPanelMovementHandlers({
  goBtnEl,
  tileXEl,
  tileYEl,
  targetFloorEl,
  poiSelectEl,
  poiBtnEl,
  getSelectedActor,
  getMap,
  getCurrentMapUrl,
  mapFloor1Url,
  mapFloor2Url,
  dispatchMoveCommand,
  getTargetMapUrl,
  dispatchControlPanelMoveCommand,
}) {
  const getTargetUrl = typeof getTargetMapUrl === "function"
    ? getTargetMapUrl
    : () => {
      if (!targetFloorEl) return typeof getCurrentMapUrl === "function" ? getCurrentMapUrl() : mapFloor1Url;
      const raw = String(targetFloorEl.value || "").toLowerCase();
      if (raw === String(mapFloor2Url).toLowerCase()) return mapFloor2Url;
      if (raw === String(mapFloor1Url).toLowerCase()) return mapFloor1Url;
      return typeof getCurrentMapUrl === "function" ? getCurrentMapUrl() : mapFloor1Url;
    };

  const sendMove = typeof dispatchControlPanelMoveCommand === "function"
    ? dispatchControlPanelMoveCommand
    : dispatchMoveCommand;

  function triggerGoToTile() {
    const actor = getSelectedActor();
    const map = getMap();
    if (!actor || !map) return;
    const x = Number(tileXEl?.value ?? NaN);
    const y = Number(tileYEl?.value ?? NaN);
    if (!Number.isInteger(x) || !Number.isInteger(y)) return;
    if (!sendMove) return;
    sendMove(actor, { x, y, mapUrl: getTargetUrl(), source: "control-panel" });
  }

  function triggerGoToPoi() {
    const actor = getSelectedActor();
    const map = getMap();
    if (!actor || !map || !poiSelectEl || poiSelectEl.selectedIndex < 0) return;
    const opt = poiSelectEl.options[poiSelectEl.selectedIndex];
    const x = Number(opt.dataset.x);
    const y = Number(opt.dataset.y);
    if (!Number.isInteger(x) || !Number.isInteger(y)) return;

    if (tileXEl) tileXEl.value = String(x);
    if (tileYEl) tileYEl.value = String(y);
    if (!sendMove) return;
    sendMove(actor, { x, y, mapUrl: getTargetUrl(), source: "control-panel" });
  }

  if (goBtnEl) goBtnEl.onclick = triggerGoToTile;
  if (tileXEl) tileXEl.onkeydown = (e) => { if (e.key === "Enter") triggerGoToTile(); };
  if (tileYEl) tileYEl.onkeydown = (e) => { if (e.key === "Enter") triggerGoToTile(); };
  if (poiBtnEl) poiBtnEl.onclick = triggerGoToPoi;
}






