import { drawActor, updateActorWalkAnimation } from "./scripts/actor-animation.js";
import { MAP_FLOOR1_URL, MAP_FLOOR2_URL, MAP_WORLD_URL, ROLE_SPRITES, ROLE_TEMPLATE } from "./scripts/app-config.js";
import { createActors } from "./scripts/actor-factory.js";
import {
  getActorById as selectActorById,
  getActorsOnCurrentMap as selectActorsOnCurrentMap,
  getSelectedActor as selectSelectedActor,
  setSelectedActor as applySelectedActor,
  setupRoleSelector as setupRoleSelectorUI,
} from "./scripts/actor-selector-interaction.js";
import { issueMoveCommand } from "./scripts/actor-monitor-interaction.js";
import { updateRuntime } from "./scripts/actor-runtime.js";
import {
  bindMapViewSelector,
  bindControlPanelMovementHandlers,
  setupPoiSelector as setupPoiControlPanel,
} from "./scripts/control-panel-interaction.js";
import { buildDoorSystem, mapDoorGid, updateDoors } from "./scripts/door-interaction.js";
import { loadImage, loadTmjMap } from "./scripts/map-loader.js";
import { bootstrapApp } from "./scripts/app-bootstrap.js";
import { createFrameLoop } from "./scripts/frame-loop.js";
import { bindCanvasClickMovement } from "./scripts/mouse-move-interaction.js";
import { dispatchActorMoveCommand } from "./scripts/move-command-dispatcher.js";
import { camera, createAppState } from "./scripts/app-state.js";
import { findFirstTileInLayer, findLayerByName, isTileInLayer, tileToWorldCenter, worldToTile } from "./scripts/map-utils.js";
import { buildBlockedGrid, findNearestWalkableGoal, findPath, isWalkable } from "./scripts/pathfinding.js";
import { renderMapScene } from "./scripts/map-renderer.js";
import { loadSceneState } from "./scripts/scene-loader.js";
import { buildServerSystem, mapServerGid } from "./scripts/server-animation.js";
import { maybeTriggerStairsTransition as handleStairsTransition } from "./scripts/stairs-transition-interaction.js";
import { buildScreenSystem, mapScreenGid } from "./scripts/surveillance-interaction.js";
import { buildTradingScreenSystem, mapTradingScreenGid } from "./scripts/trading-interaction.js";
import { startGlobalWsListener } from "./scripts/ws-global-listener.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false });
const statusEl = document.getElementById("status");
const roleSelectEl = document.getElementById("roleSelect");
const commandRoleSelectEl = document.getElementById("commandRoleSelect");
const viewMapSelectEl = document.getElementById("viewMapSelect");
const tileXEl = document.getElementById("tileX");
const tileYEl = document.getElementById("tileY");
const targetFloorEl = document.getElementById("targetFloor");
const goBtnEl = document.getElementById("goBtn");
const poiSelectEl = document.getElementById("poiSelect");
const poiBtnEl = document.getElementById("poiBtn");

const state = createAppState(MAP_FLOOR1_URL);
let positionsSnapshotLoaded = false;
let positionsSnapshotInFlight = false;
const INTERACTABLE_LAYER_HINTS = ["surveillance", "table", "chair", "tool", "clutter"];

function setStatus(text) {
  statusEl.textContent = text;
}

function getCanvasViewport() {
  const width = canvas.clientWidth || canvas.width || window.innerWidth;
  const height = canvas.clientHeight || canvas.height || window.innerHeight;
  return { width, height };
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const { width, height } = getCanvasViewport();
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function getActorById(id) {
  return selectActorById(state, id);
}

function getSelectedActor() {
  return selectSelectedActor(state);
}

function getCommandActor() {
  return selectActorById(state, state.commandActorId) || getSelectedActor();
}

function getActorsOnCurrentMap() {
  return selectActorsOnCurrentMap(state);
}

function getMapByUrl(mapUrl) {
  if (!mapUrl) return null;
  if (state.currentMapUrl === mapUrl && state.map) return state.map;
  return state.sceneCache[mapUrl]?.map || null;
}

function getBlockedByUrl(mapUrl) {
  if (!mapUrl) return null;
  if (state.currentMapUrl === mapUrl && state.blocked) return state.blocked;
  return state.sceneCache[mapUrl]?.blocked || null;
}

function getSceneByUrl(mapUrl) {
  if (!mapUrl) return null;
  if (state.currentMapUrl === mapUrl) {
    return {
      map: state.map,
      blocked: state.blocked,
      doorSystem: state.doorSystem,
      screenSystem: state.screenSystem,
      serverSystem: state.serverSystem,
      tradingScreenSystem: state.tradingScreenSystem,
    };
  }
  return state.sceneCache[mapUrl] || null;
}

async function ensureSceneCached(mapUrl) {
  if (!mapUrl || state.sceneCache[mapUrl]) return;
  const map = await loadTmjMap(mapUrl);
  const blocked = buildBlockedGrid(map);
  state.sceneCache[mapUrl] = {
    map,
    blocked,
    doorSystem: buildDoorSystem(map),
    screenSystem: buildScreenSystem(map),
    serverSystem: buildServerSystem(map),
    tradingScreenSystem: buildTradingScreenSystem(map),
  };
}

function setSelectedActor(id) {
  applySelectedActor({ state, id, loadScene, setStatus });
}

function setupRoleSelector() {
  setupRoleSelectorUI({ state, roleSelectEl, onChangeActorId: setSelectedActor });
}

function setCommandActor(id) {
  const actor = selectActorById(state, id);
  if (!actor) return;
  state.commandActorId = id;
  if (commandRoleSelectEl) commandRoleSelectEl.value = id;
}

function setupCommandRoleSelector() {
  if (!commandRoleSelectEl) return;
  commandRoleSelectEl.innerHTML = "";
  for (const actor of state.actors) {
    const opt = document.createElement("option");
    opt.value = actor.id;
    opt.textContent = actor.name;
    commandRoleSelectEl.appendChild(opt);
  }
  commandRoleSelectEl.value = state.commandActorId || state.actors[0]?.id || "";
  commandRoleSelectEl.onchange = () => setCommandActor(commandRoleSelectEl.value);
}

function ensureCommandRoleSelectorReady() {
  if (!commandRoleSelectEl) return;
  if (!state.actors.length) return;
  if (commandRoleSelectEl.options.length > 0) return;
  setupCommandRoleSelector();
}

function setupPoiSelector() {
  if (viewMapSelectEl) {
    viewMapSelectEl.value = state.currentMapUrl;
  }
  if (targetFloorEl) {
    targetFloorEl.value = state.currentMapUrl;
  }
  setupPoiControlPanel(
    poiSelectEl,
    state.screenSystem?.groups || [],
    state.tradingScreenSystem?.groups || []
  );
}

function getControlPanelTargetMapUrl() {
  const raw = String(targetFloorEl?.value || "").toLowerCase();
  if (raw === MAP_FLOOR2_URL.toLowerCase()) return MAP_FLOOR2_URL;
  if (raw === MAP_WORLD_URL.toLowerCase()) return MAP_WORLD_URL;
  if (raw === MAP_FLOOR1_URL.toLowerCase()) return MAP_FLOOR1_URL;
  return state.currentMapUrl;
}

function clearActorInteractionState(actor) {
  actor.path = [];
  actor.sitTask = null;
  actor.isSitting = false;
  actor.seatedChair = null;
  actor.screenAnimOn = false;
  actor.activeScreenGroupId = null;
  actor.activeTradingScreenGroupId = null;
}

function isInteractableTile(map, tx, ty) {
  if (!map || !Number.isInteger(tx) || !Number.isInteger(ty)) return false;
  for (const layer of map.layers) {
    const lower = String(layer?.name || "").toLowerCase();
    if (!INTERACTABLE_LAYER_HINTS.some((h) => lower.includes(h))) continue;
    if (isTileInLayer(layer, map, tx, ty)) return true;
  }
  return false;
}

function restoreInteractionIfNeeded(actor, map, blocked, interactionTile, mapUrl) {
  if (!actor || !map || !blocked || !interactionTile) return;
  if (!isInteractableTile(map, interactionTile.x, interactionTile.y)) return;
  const scene = getSceneByUrl(mapUrl);
  issueMoveCommand(actor, { x: interactionTile.x, y: interactionTile.y }, {
    map,
    blocked,
    worldToTile,
    findNearestWalkableGoal,
    findPath,
    screenGroups: scene?.screenSystem?.groups || [],
    tradingScreenGroups: scene?.tradingScreenSystem?.groups || [],
  });
  if (actor.sitTask && actor.path.length === 0) {
    const pt = worldToTile(map, actor.x, actor.y);
    if (pt.x === actor.sitTask.goal.x && pt.y === actor.sitTask.goal.y) {
      actor.isSitting = true;
      actor.screenAnimOn = true;
      actor.screenAnimTime = 0;
      actor.activeScreenGroupId = actor.sitTask.screenGroupId ?? null;
      actor.activeTradingScreenGroupId = actor.sitTask.tradingScreenGroupId ?? null;
      actor.seatedChair = actor.sitTask.chair;
      actor.dir = "up";
      actor.sitTask = null;
    }
  }
}

function resolveActorByBackendId(rawId) {
  const id = String(rawId || "");
  if (!id) return null;
  const byId = getActorById(id);
  if (byId) return byId;
  const lower = id.toLowerCase();
  return state.actors.find((a) => a.id.toLowerCase() === lower || a.name.toLowerCase() === lower) || null;
}

async function applyBackendPositionsSnapshot() {
  if (positionsSnapshotLoaded || positionsSnapshotInFlight) return;
  positionsSnapshotInFlight = true;

  const apiBase = (() => {
    const fromGlobal = window.__AI_WORLD_API_BASE__;
    if (typeof fromGlobal === "string" && fromGlobal.trim()) return fromGlobal.trim().replace(/\/+$/, "");
    const fromQuery = new URLSearchParams(window.location.search).get("api");
    if (typeof fromQuery === "string" && fromQuery.trim()) return fromQuery.trim().replace(/\/+$/, "");
    const protocol = window.location.protocol || "http:";
    const host = window.location.hostname || "127.0.0.1";
    return `${protocol}//${host}:8000`;
  })();
  const positionsUrl = `${apiBase}/api/positions`;

  let data = null;
  try {
    console.info("[positions] fetching:", positionsUrl);
    const res = await fetch(positionsUrl, { method: "GET" });
    if (!res.ok) {
      console.warn("[positions] fetch failed:", res.status);
      return;
    }
    data = await res.json();
  } catch (err) {
    console.warn("[positions] fetch error:", err);
    return;
  } finally {
    positionsSnapshotInFlight = false;
  }

  const positions = Array.isArray(data?.positions) ? data.positions : [];
  if (!positions.length) {
    console.warn("[positions] empty positions");
    return;
  }

  for (const item of positions) {
    const actor = resolveActorByBackendId(item?.actorId);
    if (!actor) continue;

    const target = item?.target && typeof item.target === "object" ? item.target : item;
    const tx = Number(target?.x);
    const ty = Number(target?.y);
    if (!Number.isInteger(tx) || !Number.isInteger(ty)) continue;

    const targetMapUrl = String(target?.mapUrl || actor.mapUrl || state.currentMapUrl);
    await ensureSceneCached(targetMapUrl);
    const map = getMapByUrl(targetMapUrl);
    const blocked = getBlockedByUrl(targetMapUrl);
    if (!map || !blocked) continue;

    const rough = { x: tx, y: ty };
    const safe = isWalkable(map, blocked, rough.x, rough.y)
      ? rough
      : (findNearestWalkableGoal(map, blocked, rough, rough, 20) || rough);
    const center = tileToWorldCenter(map, safe.x, safe.y);

    actor.x = center.x;
    actor.y = center.y;
    actor.mapUrl = targetMapUrl;
    clearActorInteractionState(actor);
    restoreInteractionIfNeeded(actor, map, blocked, rough, targetMapUrl);
  }

  positionsSnapshotLoaded = true;
  console.info("[positions] applied");

  if (state.currentMapUrl !== MAP_FLOOR1_URL) {
    await loadScene(MAP_FLOOR1_URL);
  } else {
    setupPoiSelector();
  }
}

function update(dt) {
  ensureCommandRoleSelectorReady();
  updateRuntime({
    dt,
    state,
    camera,
    getMapByUrl,
    getBlockedByUrl,
    ensureSceneCached,
    getActorsOnCurrentMap,
    getSelectedActor,
    tileToWorldCenter,
    worldToTile,
    updateActorWalkAnimation,
    updateDoors,
    handleStairsTransition,
    issueDeferredMoveCommand: dispatchMoveCommand,
    loadScene,
    findLayerByName,
    findFirstTileInLayer,
    isTileInLayer,
    isWalkable,
    findNearestWalkableGoal,
    mapFloor1Url: MAP_FLOOR1_URL,
    mapFloor2Url: MAP_FLOOR2_URL,
    mapWorldUrl: MAP_WORLD_URL,
    getViewportSize: getCanvasViewport,
  });
}

function render() {
  const { map } = state;
  const actorsOnMap = getActorsOnCurrentMap();
  const viewport = getCanvasViewport();
  renderMapScene(ctx, {
    map,
    camera,
    actorsOnMap,
    selectedActorId: state.selectedActorId,
    roleSprites: state.roleSprites,
    roleTemplateDirRow: ROLE_TEMPLATE.dirRow,
    drawActor,
    viewport,
    remapGid: (layer, gid, tileIndex) => {
      let result = gid;
      if (layer.name.toLowerCase() === "door") result = mapDoorGid(result, tileIndex, state.doorSystem);
      result = mapScreenGid(result, tileIndex, state.screenSystem, actorsOnMap);
      result = mapTradingScreenGid(result, tileIndex, state.tradingScreenSystem, actorsOnMap);
      result = mapServerGid(result, tileIndex, state.serverSystem, state.globalAnimTime);
      return result;
    },
  });
}

const frame = createFrameLoop({ update, render });

function dispatchMoveCommand(actor, rawGoal) {
  const normalizedGoal = { ...rawGoal };
  if (!normalizedGoal.source && rawGoal && Object.prototype.hasOwnProperty.call(rawGoal, "mapUrl")) {
    normalizedGoal.source = "control-panel";
  }
  if (!normalizedGoal.source) {
    const active = document.activeElement;
    const fromControlPanel = active === goBtnEl
      || active === tileXEl
      || active === tileYEl
      || active === poiBtnEl
      || active === poiSelectEl
      || active === targetFloorEl;
    if (fromControlPanel) normalizedGoal.source = "control-panel";
  }

  if (!normalizedGoal.mapUrl) {
    if (normalizedGoal.source === "control-panel" && targetFloorEl?.value) {
      normalizedGoal.mapUrl = targetFloorEl.value;
    } else {
      normalizedGoal.mapUrl = actor?.mapUrl || state.currentMapUrl;
    }
  }

  console.debug("[move]", {
    actorId: actor?.id,
    actorMapUrl: actor?.mapUrl,
    source: normalizedGoal?.source,
    targetMapUrl: normalizedGoal?.mapUrl,
    x: normalizedGoal?.x,
    y: normalizedGoal?.y,
  });
  dispatchActorMoveCommand({
    actor,
    rawGoal: normalizedGoal,
    state,
    issueMoveCommand,
    getMapByUrl,
    getBlockedByUrl,
    getSceneByUrl,
    findFirstTileInLayer,
    mapFloor1Url: MAP_FLOOR1_URL,
    mapFloor2Url: MAP_FLOOR2_URL,
    mapWorldUrl: MAP_WORLD_URL,
    worldToTile,
    findNearestWalkableGoal,
    findPath,
  });
}

bindCanvasClickMovement({
  canvas,
  getSelectedActor: getCommandActor,
  getMap: () => state.map,
  getCamera: () => camera,
  worldToTile,
  dispatchMoveCommand,
});

window.addEventListener("resize", resize);
bindMapViewSelector({
  viewMapSelectEl,
  getCurrentMapUrl: () => state.currentMapUrl,
  mapFloor1Url: MAP_FLOOR1_URL,
  mapFloor2Url: MAP_FLOOR2_URL,
  mapWorldUrl: MAP_WORLD_URL,
  onChangeMapUrl: (mapUrl) => loadScene(mapUrl),
  setStatus,
});

bindControlPanelMovementHandlers({
  goBtnEl,
  tileXEl,
  tileYEl,
  targetFloorEl,
  poiSelectEl,
  poiBtnEl,
  getSelectedActor: getCommandActor,
  getMap: () => state.map,
  getCurrentMapUrl: () => state.currentMapUrl,
  mapFloor1Url: MAP_FLOOR1_URL,
  mapFloor2Url: MAP_FLOOR2_URL,
  mapWorldUrl: MAP_WORLD_URL,
  dispatchMoveCommand,
  getTargetMapUrl: getControlPanelTargetMapUrl,
  dispatchControlPanelMoveCommand: dispatchMoveCommand,
});

startGlobalWsListener({
  getActorById,
  onMoveCommand: dispatchMoveCommand,
  setStatus,
});

async function loadScene(mapUrl, spawnLayerName = null, spawnOffset = { x: 0, y: 0 }, transferActorId = null) {
  await loadSceneState({
    mapUrl,
    spawnLayerName,
    spawnOffset,
    transferActorId,
    state,
    deps: {
      loadTmjMap,
      buildBlockedGrid,
      buildDoorSystem,
      buildScreenSystem,
      buildServerSystem,
      buildTradingScreenSystem,
      createActors,
      isWalkable,
      tileToWorldCenter,
      findFirstTileInLayer,
      findNearestWalkableGoal,
      setupRoleSelector,
      setupCommandRoleSelector,
      setupPoiSelector,
    },
  });
  resize();
}

bootstrapApp({
  resize,
  roleSpritesConfig: ROLE_SPRITES,
  loadImage,
  state,
  loadScene,
  afterInitialSceneLoaded: applyBackendPositionsSnapshot,
  mapFloor1Url: MAP_FLOOR1_URL,
  setStatus,
  startFrameLoop: () => requestAnimationFrame(frame),
})
  .then(() => applyBackendPositionsSnapshot())
  .catch((err) => {
    console.error(err);
    setStatus(`Load failed: ${err.message}`);
  });
