/**
 * Mép nắp phong bì ở đầu footer: hai nét chéo mảnh gặp nhau ở giữa,
 * đầu nhọn đóng dấu sáp xanh thương hiệu. Footer trắng như mặt giấy thiệp.
 */
export function FooterFlap() {
  return (
    <div aria-hidden className="relative h-[64px] w-full sm:h-[76px]">
      <svg viewBox="0 0 1000 76" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <polygon points="0,0 1000,0 500,76" fill="#f5f7fb" />
        <polyline
          points="0,0 500,76 1000,0"
          fill="none"
          stroke="#d5dde9"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Dấu sáp */}
      <span
        className="absolute left-1/2 top-full grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white ring-[5px] ring-white"
        style={{
          background: "radial-gradient(circle at 32% 28%, #3f72ad 0%, #27548A 55%, #1b3d66 100%)",
          boxShadow: "0 8px 18px -8px rgba(27,61,102,.65), inset 0 0 0 1px rgba(255,255,255,.18)",
        }}
      >
        <span className="absolute inset-[5px] rounded-full border border-white/35" />
        <span className="relative text-[17px] font-bold italic leading-none tracking-tight">i</span>
      </span>
    </div>
  );
}
