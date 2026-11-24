/* Logo iCards: dấu hiệu là một thiệp mời vuông đặt trên thiệp khác, con dấu tròn ở giữa,
   dùng đúng màu xanh thương hiệu #27548A. Dùng làm logo mặc định khi admin chưa tải logo lên. */

export function BrandMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      aria-hidden
      focusable="false"
      style={{ display: "block", flexShrink: 0 }}
    >
      <rect width="48" height="48" fill="#27548A" />
      <g transform="rotate(12 26 28)">
        <rect x="15" y="10" width="22" height="28" fill="#A9C2E2" />
      </g>
      <g transform="rotate(-7 22 26)">
        <rect x="11" y="11" width="24" height="30" fill="#FFFFFF" />
        <rect x="14.5" y="14.5" width="17" height="23" fill="none" stroke="#27548A" strokeWidth="1" />
        <circle cx="23" cy="25.5" r="3.6" fill="#27548A" />
        <path d="M17.5 19.5h11" stroke="#27548A" strokeWidth="1" strokeLinecap="square" />
        <path d="M17.5 31.5h11" stroke="#27548A" strokeWidth="1" strokeLinecap="square" />
      </g>
    </svg>
  );
}

/* Lockup: dấu hiệu + tên. Nếu tên kết thúc bằng ".com.vn" thì phần đuôi hiển thị nhỏ, nhạt hơn. */
export function BrandLogo({ name = "iCards.com.vn" }: { name?: string }) {
  // Luôn có chữ thương hiệu: nếu tên trống thì dùng "iCards.com.vn"
  const label = name?.trim() || "iCards.com.vn";
  const match = label.match(/^(.*?)(\.com\.vn)$/i);
  const base = match ? match[1] || "iCards" : label;
  const suffix = match ? match[2] : "";
  return (
    <span className="brand-lockup" style={{ display: "inline-flex", alignItems: "center", gap: 12, lineHeight: 1 }}>
      <BrandMark size={36} />
      <span style={{ display: "inline-flex", alignItems: "baseline", gap: 1, whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "#27548A" }}>{base}</span>
        {suffix && (
          <span style={{ fontSize: 15, fontWeight: 500, color: "#8A97A8", letterSpacing: "0.01em" }}>{suffix}</span>
        )}
      </span>
    </span>
  );
}
