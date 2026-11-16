/**
 * Thiết kế bản đồ cho từng KIỂU TRANG (13 kiểu trong tab "Kiểu trang").
 *
 * Mỗi kiểu có:
 *  - style: mã style MapTiler (họ -v4; style "toner" và "basic/streets/outdoor-v2" đã ngừng hỗ trợ nên không dùng)
 *  - frame: khung bao quanh bản đồ, theo đúng ngôn ngữ thiết kế của kiểu trang
 *  - marker: hình ghim
 *
 * Muốn đổi look của một kiểu chỉ cần sửa dòng tương ứng ở đây.
 */

export type MapFrame = "plain" | "double" | "round" | "offset" | "glass" | "dashed";
export type MapMarker = "pin" | "ring" | "dot";

export type VenueMapTheme = {
  /** mã style của MapTiler, vd "streets-v4", "dataviz-v4-dark" */
  style: string;
  frame: MapFrame;
  marker: MapMarker;
  /** mức zoom khi đã có ghim */
  zoom?: number;
};

export const VENUE_MAP_THEMES: Record<string, VenueMapTheme> = {
  // Principal: tối giản, sáng, khung mảnh
  principal: { style: "base-v4-light", frame: "plain", marker: "pin" },
  // Bunting: phố xá, náo nhiệt, màu vui
  bunting: { style: "landscape-v4-vivid", frame: "plain", marker: "pin" },
  // Sloane: sans in hoa, hiện đại -> bản đồ dữ liệu sáng, ghim vòng tròn
  sloane: { style: "dataviz-v4-light", frame: "plain", marker: "ring" },
  // Offset: khối đậm, bóng lệch -> bản đồ phẳng, khung đen + bóng màu nhấn
  offset: { style: "base-v4", frame: "offset", marker: "pin" },
  // Plume: thư pháp, mềm -> bản đồ màu nước
  plume: { style: "aquarelle-v4", frame: "plain", marker: "ring" },
  // Heritage: cổ điển -> bản địa hình cũ, khung kép
  heritage: { style: "topo-v4-pastel", frame: "double", marker: "ring" },
  // Gazette: báo chí -> bản đồ xám trung tính, khung kép như trang báo
  gazette: { style: "backdrop-v4-light", frame: "double", marker: "pin" },
  // Botanica: vườn hoa -> bản đồ xanh, bo tròn
  botanica: { style: "outdoor-v4", frame: "round", marker: "pin" },
  // Art Deco: đen-vàng, hình học -> bản đồ tối, khung vát
  deco: { style: "dataviz-v4-dark", frame: "offset", marker: "ring" },
  // Confetti: tiệc vui -> bản đồ đường phố nhiều màu, bo tròn
  confetti: { style: "streets-v4", frame: "round", marker: "pin" },
  // Blueprint: bản vẽ kỹ thuật -> bản đồ xanh biển, khung nét đứt, ghim chữ thập
  blueprint: { style: "ocean-v4", frame: "dashed", marker: "dot" },
  // Monogram: chữ lồng -> bản địa hình nhẹ, bo tròn, ghim vòng
  monogram: { style: "landscape-v4", frame: "round", marker: "ring" },
  // Aurora: cực quang -> bản đêm, thẻ kính mờ
  aurora: { style: "winter-v4-dark", frame: "glass", marker: "dot" },
};

const FALLBACK: VenueMapTheme = { style: "base-v4-light", frame: "plain", marker: "pin" };

export function venueMapTheme(styleId: string): VenueMapTheme {
  return VENUE_MAP_THEMES[styleId] ?? FALLBACK;
}
