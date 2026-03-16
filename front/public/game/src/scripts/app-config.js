/*
 * 妯″潡鑱岃矗
 * - 闆嗕腑瀛樻斁搴旂敤鍩虹閰嶇疆甯搁噺锛堣鑹叉ā鏉裤€佽鑹茶祫婧愩€佸湴鍥捐矾寰勶級銆?
 *
 * 杩愯/璋冪敤椤哄簭
 * 1. main 鍦ㄥ惎鍔ㄦ椂瀵煎叆杩欎簺甯搁噺銆?
 * 2. 鍚勬ā鍧楅€氳繃 main 浼犻€掍娇鐢ㄨ繖浜涢厤缃€?
 *
 * 瀵煎嚭姒傝堪
 * - ROLE_TEMPLATE: 瑙掕壊鍔ㄧ敾妯℃澘閰嶇疆銆?
 * - ROLE_SPRITES: 瑙掕壊绮剧伒璧勬簮閰嶇疆銆?
 * - MAP_FLOOR1_URL / MAP_FLOOR2_URL: 鍦烘櫙鍦板浘鍦板潃銆?
 */

export const ROLE_TEMPLATE = {
  cols: 4,
  rows: 4,
  dirRow: { down: 0, left: 1, right: 2, up: 3 },
};

export const ROLE_SPRITES = {
  default: {
    url: "./asset/role/Edward.png",
    cols: ROLE_TEMPLATE.cols,
    rows: ROLE_TEMPLATE.rows,
    dirRow: ROLE_TEMPLATE.dirRow,
  },
  bob: {
    url: "./asset/role/Bob.png",
    cols: ROLE_TEMPLATE.cols,
    rows: ROLE_TEMPLATE.rows,
    dirRow: ROLE_TEMPLATE.dirRow,
  },
};

export const MAP_FLOOR1_URL = "./map/map.tmj";
export const MAP_FLOOR2_URL = "./map/map2.tmj";

export const MAP_WORLD_URL = './map/world_map.tmj';

