const globalFeed = {
  name: "Global Overview",
  summary: "默认展示全球资讯总览，不预设具体国家或地区。点击地球上的任意国家后，右侧会切换到该国家的专属资讯视图。",
  tags: ["全球", "突发", "经济", "科技"],
  news: [
    { source: "World Brief", time: "3m ago", title: "Global markets track policy signals across major economies", description: "投资者同时关注北美、欧洲和亚洲的政策与市场预期，跨区域联动成为新闻主线。" },
    { source: "Geo Watch", time: "11m ago", title: "Energy, shipping and supply chain stories remain globally linked", description: "能源价格、航运通道与制造链条的变化，持续推动全球新闻热度。" },
    { source: "Tech Radar", time: "18m ago", title: "AI deployment and regulation shape headlines in multiple regions", description: "AI 基础设施、应用落地与监管讨论，已经成为全球科技资讯的共同焦点。" },
    { source: "Capital Lens", time: "26m ago", title: "Cross-border investment themes dominate international coverage", description: "从制造业迁移到新兴市场机会，跨境资本流向继续影响全球报道结构。" }
  ]
};

const newsSeed = {
  us: {
    name: "United States",
    aliases: ["United States of America", "USA", "US"],
    lat: 38,
    lon: -97,
    color: "#53e0c1",
    summary: "美国资讯流覆盖科技、金融、政治和国际关系，通常也是全球突发新闻和资本市场波动的高密度来源。",
    tags: ["科技", "金融市场", "政策", "AI"],
    news: [
      { source: "Global Wire", time: "2m ago", title: "AI infrastructure spending remains a top U.S. market focus", description: "企业持续加码算力、数据中心与半导体投入，带动科技与资本市场相关新闻占据头条。" },
      { source: "World Brief", time: "15m ago", title: "Federal policy debates reshape energy and industrial outlook", description: "围绕制造业回流、清洁能源和利率路径的讨论，影响多个行业板块的舆论与政策预期。" },
      { source: "City Ledger", time: "27m ago", title: "Major metro areas see renewed startup funding momentum", description: "一级市场融资活动回暖，纽约、旧金山和奥斯汀成为创业新闻高频区域。" }
    ]
  },
  cn: {
    name: "China",
    aliases: ["People's Republic of China"],
    lat: 35,
    lon: 103,
    color: "#ff9b71",
    summary: "中国资讯通常集中在宏观经济、制造业、科技平台、跨境贸易与区域政策，覆盖面广且节奏快。",
    tags: ["宏观经济", "制造业", "跨境贸易", "科技"],
    news: [
      { source: "Asia Desk", time: "5m ago", title: "Manufacturing and export indicators remain in focus", description: "市场持续关注制造业景气、出口恢复情况以及供应链相关政策信号。" },
      { source: "Market Pulse", time: "18m ago", title: "Platform economy updates draw investor attention", description: "围绕平台企业、AI 应用和新消费模式的进展，是中国科技资讯的重要组成部分。" },
      { source: "Policy Watch", time: "31m ago", title: "Regional development plans highlight infrastructure and innovation", description: "地方层面的产业升级和科技园区建设，正在推动区域新闻热度上升。" }
    ]
  },
  jp: {
    name: "Japan",
    lat: 36,
    lon: 138,
    color: "#6bb8ff",
    summary: "日本新闻热点常围绕半导体、汽车、汇率、能源与地区安全议题，内容兼具产业性和国际性。",
    tags: ["半导体", "汽车", "汇率", "能源"],
    news: [
      { source: "Tokyo Report", time: "8m ago", title: "Chip investment and industrial policy stay on the agenda", description: "日本在先进制造和供应链安全方面的布局，持续获得全球媒体关注。" },
      { source: "Nikkei Snapshot", time: "22m ago", title: "Automakers adjust strategy amid EV and battery competition", description: "传统车企与新技术路线的竞争，带动产业与资本市场双重讨论。" },
      { source: "Pacific Monitor", time: "36m ago", title: "Currency moves influence trade and consumer sentiment", description: "日元波动继续影响进口成本、旅游消费和出口企业表现。" }
    ]
  },
  gb: {
    name: "United Kingdom",
    aliases: ["United Kingdom of Great Britain and Northern Ireland", "Britain"],
    lat: 55,
    lon: -3,
    color: "#53e0c1",
    summary: "英国新闻流以金融、公共政策、科技监管与欧洲关系为主，伦敦仍是全球金融资讯核心节点之一。",
    tags: ["金融", "监管", "欧洲关系", "创投"],
    news: [
      { source: "London Brief", time: "12m ago", title: "Financial services updates dominate UK business headlines", description: "围绕监管、资本流动和国际业务布局的消息继续占据英国商业版面。" },
      { source: "Civic Monitor", time: "29m ago", title: "Public sector reform proposals trigger debate", description: "财政、公共服务与地方治理相关议题带来广泛讨论。" },
      { source: "Tech Current", time: "41m ago", title: "AI governance and startup policy remain active topics", description: "英国在 AI 治理与科技创业支持上的动作持续受到关注。" }
    ]
  },
  fr: {
    name: "France",
    lat: 46,
    lon: 2,
    color: "#ff9b71",
    summary: "法国资讯聚焦欧洲政治、能源转型、工业政策与文化经济，在欧盟语境下具有较强影响力。",
    tags: ["欧洲政治", "能源转型", "工业", "文化经济"],
    news: [
      { source: "Paris Wire", time: "6m ago", title: "Industrial policy and EU coordination remain central themes", description: "法国持续在产业竞争力与欧盟合作框架中推动政策议题。" },
      { source: "Euro Journal", time: "17m ago", title: "Energy transition plans shape business expectations", description: "能源结构调整和电力体系改革影响企业投资判断。" },
      { source: "Continental Desk", time: "49m ago", title: "Consumer and tourism sectors show seasonal shifts", description: "消费恢复、旅游热度和文化产业活动共同推动法国相关新闻增长。" }
    ]
  },
  br: {
    name: "Brazil",
    lat: -14,
    lon: -52,
    color: "#6bb8ff",
    summary: "巴西的资讯热点多与农业、大宗商品、能源、雨林保护和拉美区域经济环境相关。",
    tags: ["农业", "大宗商品", "能源", "环境"],
    news: [
      { source: "LatAm News", time: "11m ago", title: "Commodity exports and agri output drive market coverage", description: "农产品和矿产出口动态，是巴西财经资讯的核心组成。" },
      { source: "Rainforest Watch", time: "24m ago", title: "Environmental policies remain closely watched", description: "围绕生态保护和绿色投资的新闻，在国际层面保持高热度。" },
      { source: "Rio Bulletin", time: "52m ago", title: "Infrastructure and energy projects gain regional attention", description: "大型基建和能源开发项目推动地方经济与就业新闻升温。" }
    ]
  },
  in: {
    name: "India",
    lat: 21,
    lon: 78,
    color: "#53e0c1",
    summary: "印度新闻密集分布于数字经济、制造业升级、消费增长、基础设施与区域外交。",
    tags: ["数字经济", "消费", "制造升级", "基建"],
    news: [
      { source: "South Asia Desk", time: "9m ago", title: "Digital services growth supports upbeat tech coverage", description: "支付、软件服务与平台业务扩张，让印度科技资讯持续活跃。" },
      { source: "Build India", time: "26m ago", title: "Infrastructure rollout shapes domestic policy headlines", description: "铁路、公路和城市开发项目不断带来新的政策与投资消息。" },
      { source: "Market South", time: "44m ago", title: "Consumer demand trends influence retail and manufacturing outlook", description: "年轻人口结构和消费升级，成为印度市场新闻的重要背景。" }
    ]
  },
  za: {
    name: "South Africa",
    lat: -30,
    lon: 24,
    color: "#ff9b71",
    summary: "南非资讯重点涉及矿业、能源、电力供应、区域贸易和社会治理，是观察非洲南部的重要入口。",
    tags: ["矿业", "电力", "区域贸易", "治理"],
    news: [
      { source: "Africa Focus", time: "13m ago", title: "Mining output and energy reliability remain key themes", description: "矿产资源与电力系统表现，对南非商业新闻影响显著。" },
      { source: "Cape Monitor", time: "28m ago", title: "Trade corridors and logistics upgrades draw attention", description: "港口、铁路和区域贸易通道优化，是近期讨论重点。" },
      { source: "Civic Brief", time: "57m ago", title: "Governance reforms shape investor sentiment", description: "公共治理与社会稳定相关议题持续影响国际观察者判断。" }
    ]
  }
};

const countryNameEl = document.getElementById("countryName");
const newsCountEl = document.getElementById("newsCount");
const countrySummaryEl = document.getElementById("countrySummary");
const countryTagsEl = document.getElementById("countryTags");
const newsListEl = document.getElementById("newsList");
const resetOverviewButton = document.getElementById("resetOverview");
const svg = d3.select("#globeSvg");

const width = 1000;
const height = 1000;
const projection = d3.geoOrthographic().translate([width / 2, height / 2]).scale(360).clipAngle(90);
const path = d3.geoPath(projection);
const graticule = d3.geoGraticule10();

let worldFeatures = [];
let selectedCountryName = null;
let rotation = [-20, -15, 0];
let isDragging = false;
let isLoaded = false;
let isPointerOverGlobe = false;

const aliasToKey = new Map();
Object.entries(newsSeed).forEach(([key, value]) => {
  aliasToKey.set(value.name.toLowerCase(), key);
  (value.aliases || []).forEach((alias) => aliasToKey.set(alias.toLowerCase(), key));
});

const defs = svg.append("defs");
const oceanGradient = defs.append("radialGradient").attr("id", "oceanGradient").attr("cx", "35%").attr("cy", "30%").attr("r", "80%");
oceanGradient.append("stop").attr("offset", "0%").attr("stop-color", "#2f6da7");
oceanGradient.append("stop").attr("offset", "55%").attr("stop-color", "#123c67");
oceanGradient.append("stop").attr("offset", "100%").attr("stop-color", "#081726");

svg.append("circle").attr("class", "ocean-sphere").attr("cx", width / 2).attr("cy", height / 2).attr("r", 360);
svg.append("path").datum(graticule).attr("class", "graticule");
const countriesLayer = svg.append("g").attr("class", "countries-layer");
const markersLayer = svg.append("g").attr("class", "markers-layer");

function normalizeName(name) {
  return (name || "").trim().toLowerCase();
}

function seedFromName(name) {
  return Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getCountryPayload(name) {
  if (!name) {
    return globalFeed;
  }

  const exactKey = aliasToKey.get(normalizeName(name));
  if (exactKey) {
    return newsSeed[exactKey];
  }

  const seed = seedFromName(name || "Country");
  return {
    name: name || "Unknown",
    lat: 0,
    lon: 0,
    color: seed % 2 === 0 ? "#53e0c1" : "#6bb8ff",
    summary: `${name || "该国家"} 已接入真实地图点击，但当前还没有预置新闻样本。下一步可以为这个国家接入实时新闻 API。`,
    tags: ["待接入 API", "真实地图", "国家区域点击"],
    news: [
      { source: "Prototype Feed", time: "just now", title: `${name || "该国家"} 已被选中`, description: "地图点击已经生效，当前显示的是占位资讯。你可以继续让我接入真实新闻接口。" }
    ]
  };
}

function updateResetButton() {
  resetOverviewButton.hidden = !selectedCountryName;
}

function renderSidebar(name = null) {
  selectedCountryName = name;
  const data = getCountryPayload(name);
  countryNameEl.textContent = data.name;
  newsCountEl.textContent = `${data.news.length} 条资讯`;
  countrySummaryEl.textContent = data.summary;

  countryTagsEl.innerHTML = "";
  data.tags.forEach((tag) => {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = tag;
    countryTagsEl.appendChild(el);
  });

  newsListEl.innerHTML = "";
  data.news.forEach((item) => {
    const card = document.createElement("article");
    card.className = "news-card";
    card.innerHTML = `<div class="news-meta"><span>${item.source}</span><span>${item.time}</span></div><h4>${item.title}</h4><p>${item.description}</p>`;
    newsListEl.appendChild(card);
  });

  updateResetButton();
  updateMap();
}

function countryHasNews(name) {
  return aliasToKey.has(normalizeName(name));
}

function updateMarkers() {
  const markerData = Object.values(newsSeed).map((item) => ({ ...item, coordinates: [item.lon, item.lat] }));
  const visibleMarkers = markerData.filter((item) => d3.geoDistance(item.coordinates, [-rotation[0], -rotation[1]]) < Math.PI / 2);
  const markers = markersLayer.selectAll("g.marker").data(visibleMarkers, (d) => d.name);

  const enter = markers.enter().append("g").attr("class", "marker").style("color", (d) => d.color);
  enter.append("circle").attr("class", "pin-pulse").attr("r", 18);
  enter.append("circle").attr("class", "pin-core").attr("r", 7);
  enter.append("line").attr("class", "pin-line");
  enter.append("text").attr("class", "country-label");

  markers.merge(enter).each(function(d) {
    const point = projection(d.coordinates);
    if (!point) {
      d3.select(this).attr("display", "none");
      return;
    }

    const [x, y] = point;
    const direction = x >= width / 2 ? 1 : -1;
    const labelX = x + direction * 56;
    const lineX = x + direction * 10;
    const lineEndX = x + direction * 42;
    const group = d3.select(this).attr("display", null);
    const active = d.name === selectedCountryName;

    group.select(".pin-pulse").attr("cx", x).attr("cy", y).attr("r", active ? 22 : 18).style("opacity", active ? 0.24 : 0.16);
    group.select(".pin-core").attr("cx", x).attr("cy", y).attr("r", active ? 9 : 7);
    group.select(".pin-line").attr("x1", lineX).attr("y1", y - 4).attr("x2", lineEndX).attr("y2", y - 24);
    group.select(".country-label").attr("x", labelX).attr("y", y - 28).attr("text-anchor", direction === 1 ? "start" : "end").text(d.name);
  });

  markers.exit().remove();
}

function updateMap() {
  projection.rotate(rotation);
  svg.select(".graticule").attr("d", path);
  countriesLayer.selectAll("path.country").attr("d", path).attr("class", (d) => {
    const classes = ["country"];
    if (countryHasNews(d.properties.name)) {
      classes.push("has-news");
    }
    if (selectedCountryName && d.properties.name === selectedCountryName) {
      classes.push("active");
    }
    return classes.join(" ");
  });
  updateMarkers();
}

function bindPointerState() {
  svg
    .on("mouseenter", () => {
      isPointerOverGlobe = true;
    })
    .on("mouseleave", () => {
      isPointerOverGlobe = false;
    });
}

function bindDrag() {
  const drag = d3.drag()
    .on("start", () => {
      isDragging = true;
      svg.classed("is-dragging", true);
    })
    .on("drag", (event) => {
      rotation[0] += event.dx * 0.35;
      rotation[1] -= event.dy * 0.35;
      rotation[1] = Math.max(-55, Math.min(55, rotation[1]));
      updateMap();
    })
    .on("end", () => {
      isDragging = false;
      svg.classed("is-dragging", false);
    });

  svg.call(drag);
}

function applyNames(nameRows) {
  const nameMap = new Map(nameRows.map((row) => [row.iso_n3, row.name]));
  worldFeatures = worldFeatures.map((feature) => ({
    ...feature,
    properties: {
      ...feature.properties,
      name: nameMap.get(String(feature.id).padStart(3, "0")) || feature.properties.name || `Country ${feature.id}`
    }
  }));
}

function ensureFallbackNames() {
  worldFeatures = worldFeatures.map((feature) => ({
    ...feature,
    properties: {
      ...feature.properties,
      name: feature.properties?.name || `Country ${feature.id}`
    }
  }));
}

function drawCountries() {
  countriesLayer.selectAll("path.country").remove();
  countriesLayer.selectAll("path.country")
    .data(worldFeatures)
    .enter()
    .append("path")
    .attr("class", (d) => countryHasNews(d.properties.name) ? "country has-news" : "country")
    .on("click", (_, d) => renderSidebar(d.properties.name));
}

function animate() {
  if (isLoaded && !isDragging && !isPointerOverGlobe) {
    rotation[0] += 0.12;
    updateMap();
  }
  requestAnimationFrame(animate);
}

async function loadWorld() {
  try {
    const topology = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((response) => response.json());
    worldFeatures = topojson.feature(topology, topology.objects.countries).features;
    ensureFallbackNames();
    drawCountries();
    bindPointerState();
    bindDrag();
    isLoaded = true;
    updateMap();

    d3.tsv("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.tsv")
      .then((nameRows) => {
        applyNames(nameRows);
        drawCountries();
        updateMap();
      })
      .catch(() => {});
  } catch (error) {
    console.error(error);
  }
}

resetOverviewButton.addEventListener("click", () => {
  renderSidebar(null);
});

renderSidebar(null);
loadWorld();
animate();
