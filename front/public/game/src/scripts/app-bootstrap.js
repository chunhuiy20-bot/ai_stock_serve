/*
 * 模块职责
 * - 负责应用启动阶段的资源加载、首场景加载与首帧启动。
 *
 * 运行/调用顺序
 * 1. main 顶层调用 bootstrapApp()。
 * 2. bootstrapApp() 加载角色贴图并初始化 state。
 * 3. 调用 loadScene() 完成首场景构建后启动帧循环。
 *
 * 函数概述
 * - bootstrapApp(context): 完成应用冷启动流程。
 */

export async function bootstrapApp({
  resize,
  roleSpritesConfig,
  loadImage,
  state,
  loadScene,
  afterInitialSceneLoaded,
  mapFloor1Url,
  setStatus,
  startFrameLoop,
}) {
  resize();
  const roleLoads = await Promise.all(
    Object.entries(roleSpritesConfig).map(async ([key, cfg]) => {
      const loaded = await loadImage(cfg.url);
      return [key, { ...cfg, img: loaded.ok ? loaded.img : null, missing: !loaded.ok }];
    })
  );

  state.roleSprites = Object.fromEntries(roleLoads);
  state.roleSpriteMissing = Object.values(state.roleSprites).some((r) => r.missing);

  await loadScene(mapFloor1Url);
  if (typeof afterInitialSceneLoaded === "function") {
    await afterInitialSceneLoaded();
  }

  const missingTiles = state.map.tilesets.filter((t) => t.imageMissing).map((t) => `${t.name} -> ${t.imageUrl}`);
  const doorReady = state.doorSystem ? "Door animation ready." : "Door animation unavailable.";
  if (missingTiles.length || state.roleSpriteMissing) {
    setStatus(`Map loaded. Missing ${missingTiles.length} tileset image(s). ${doorReady}`);
    if (missingTiles.length) console.warn("Missing tileset images:", missingTiles);
    for (const [key, role] of Object.entries(state.roleSprites)) {
      if (role.missing) console.warn("Missing role sprite:", key, role.url);
    }
  } else {
    setStatus(`Map loaded. ${doorReady}`);
  }

  startFrameLoop();
}
