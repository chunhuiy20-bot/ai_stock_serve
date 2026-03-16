/*
 * 模块职责
 * - 负责地图与贴图资源加载（TMJ/TSX/PNG）。
 *
 * 运行/调用顺序
 * 1. loadSceneState() 调用 loadTmjMap() 加载地图结构。
 * 2. bootstrapApp() 调用 loadImage() 加载角色贴图。
 *
 * 函数概述
 * - loadImage(url): 加载图片资源。
 * - loadTmjMap(tmjUrl): 加载 TMJ 并解析 tilesets/layers。
 */

function fileNameFromPath(path) {
  return path.split(/[\\/]/).pop();
}

async function loadXml(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${url}`);
  const text = await res.text();
  return new DOMParser().parseFromString(text, "application/xml");
}

async function loadJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${url}`);
  return res.json();
}

export async function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ ok: true, img, url });
    img.onerror = () => resolve({ ok: false, img: null, url });
    img.src = url;
  });
}

async function loadTsxOrPngTileset(tilesetRef, mapTileW, mapTileH) {
  const firstgid = Number(tilesetRef.firstgid);
  const source = tilesetRef.source || "";
  const sourceName = fileNameFromPath(source);
  const tsxUrl = `./asset/${sourceName}`;

  try {
    const tsxXml = await loadXml(tsxUrl);
    const tileset = tsxXml.querySelector("tileset");
    const imageNode = tileset.querySelector("image");
    const imageSource = imageNode.getAttribute("source");
    const imageName = fileNameFromPath(imageSource);
    const imageUrl = `./asset/${imageName}`;
    const imgResult = await loadImage(imageUrl);

    return {
      firstgid,
      sourceName,
      name: tileset.getAttribute("name") || sourceName,
      tilewidth: Number(tileset.getAttribute("tilewidth")),
      tileheight: Number(tileset.getAttribute("tileheight")),
      columns: Number(tileset.getAttribute("columns")),
      tilecount: Number(tileset.getAttribute("tilecount")),
      image: imgResult.ok ? imgResult.img : null,
      imageUrl,
      imageMissing: !imgResult.ok,
    };
  } catch {
    const pngName = sourceName.replace(/\.tsx$/i, ".png");
    const imageUrl = `./asset/${pngName}`;
    const imgResult = await loadImage(imageUrl);
    const img = imgResult.img;
    const tilewidth = mapTileW;
    const tileheight = mapTileH;
    const columns = img ? Math.max(1, Math.floor(img.width / tilewidth)) : 1;
    const rows = img ? Math.max(1, Math.floor(img.height / tileheight)) : 1;

    return {
      firstgid,
      sourceName,
      name: sourceName.replace(/\.tsx$/i, ""),
      tilewidth,
      tileheight,
      columns,
      tilecount: columns * rows,
      image: imgResult.ok ? imgResult.img : null,
      imageUrl,
      imageMissing: !imgResult.ok,
    };
  }
}

export async function loadTmjMap(tmjUrl) {
  const raw = await loadJson(tmjUrl);
  const width = Number(raw.width);
  const height = Number(raw.height);
  const tileWidth = Number(raw.tilewidth);
  const tileHeight = Number(raw.tileheight);

  const tilesets = [];
  for (const ts of raw.tilesets || []) {
    const parsed = await loadTsxOrPngTileset(ts, tileWidth, tileHeight);
    tilesets.push(parsed);
  }
  tilesets.sort((a, b) => a.firstgid - b.firstgid);

  const layers = (raw.layers || [])
    .filter((l) => l.type === "tilelayer")
    .map((l) => ({
      id: Number(l.id),
      name: l.name,
      width: Number(l.width),
      height: Number(l.height),
      data: (l.data || []).map((n) => Number(n)),
    }));

  return { width, height, tileWidth, tileHeight, tilesets, layers };
}
