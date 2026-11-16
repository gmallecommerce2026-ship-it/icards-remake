// Chép file worker của maplibre-gl vào public/maplibre để bản đồ tự tải đúng đường dẫn.
// Chạy tự động trước dev / build / sau install, nên nâng cấp maplibre-gl là worker tự khớp phiên bản.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs");
const destDir = resolve(root, "public/maplibre");

if (!existsSync(src)) {
  console.warn("[maplibre] Không thấy node_modules/maplibre-gl, bỏ qua bước chép worker.");
  process.exit(0);
}
mkdirSync(destDir, { recursive: true });
copyFileSync(src, resolve(destDir, "maplibre-gl-worker.mjs"));
console.log("[maplibre] Đã chép maplibre-gl-worker.mjs vào public/maplibre");
