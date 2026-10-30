import type { CSSProperties, ReactNode } from "react";
import type { InvitationTemplate } from "@/lib/templates";

type Props = {
  template: InvitationTemplate;
  /** card: chỉ trang bìa, tỉ lệ 3:4. full: toàn bộ thiệp dạng trang dài (dùng trong khung điện thoại) */
  variant?: "card" | "full";
  className?: string;
};

// Mọi cỡ chữ và khoảng cách dùng đơn vị cqw (theo bề rộng khung chứa)
// nên cùng một component co giãn đúng ở cả thẻ nhỏ lẫn khung điện thoại.
const display = { fontFamily: "var(--font-tpl-display), Georgia, serif" } satisfies CSSProperties;

function Motif({ template }: { template: InvitationTemplate }) {
  const { accent, soft } = template.palette;
  switch (template.motif) {
    case "arch":
      return (
        <div
          aria-hidden
          style={{ width: "26cqw", height: "36cqw", background: soft, border: `0.5cqw solid ${accent}`, borderRadius: "13cqw 13cqw 0 0" }}
        />
      );
    case "circle":
      return (
        <div
          aria-hidden
          style={{ width: "30cqw", height: "30cqw", background: soft, borderRadius: "50%", boxShadow: `0 0 0 2cqw ${template.palette.bg}, 0 0 0 2.5cqw ${accent}` }}
        />
      );
    case "frame":
      return (
        <div aria-hidden style={{ width: "26cqw", height: "34cqw", border: `0.5cqw solid ${accent}`, padding: "2cqw" }}>
          <div style={{ width: "100%", height: "100%", background: soft }} />
        </div>
      );
    case "stripe":
      return (
        <div aria-hidden style={{ display: "flex", alignItems: "flex-end", gap: "1.6cqw", height: "30cqw" }}>
          {[14, 22, 30, 22, 14].map((h, i) => (
            <div key={i} style={{ width: "3.4cqw", height: `${h}cqw`, background: i === 2 ? accent : soft }} />
          ))}
        </div>
      );
  }
}

function Cover({ template, tall }: { template: InvitationTemplate; tall: boolean }) {
  const { sample } = template;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "5cqw",
        padding: "10cqw 8cqw",
        height: tall ? undefined : "100%",
        minHeight: tall ? "165cqw" : undefined,
      }}
    >
      <p style={{ fontSize: "3.6cqw", letterSpacing: "0.03em", opacity: 0.8 }}>{sample.kicker}</p>
      <Motif template={template} />
      <h3 style={{ ...display, fontSize: "11cqw", lineHeight: 1.05, fontWeight: 600 }}>
        {sample.titleLines.map((line, i) => (
          <span key={i} style={{ display: "block", fontSize: line === "&" ? "7cqw" : undefined, fontStyle: line === "&" ? "italic" : undefined, opacity: line === "&" ? 0.7 : 1 }}>
            {line}
          </span>
        ))}
      </h3>
      <p style={{ fontSize: "4cqw", fontWeight: 500 }}>{sample.date}</p>
    </div>
  );
}

function Block({ title, children, template }: { title: string; children: ReactNode; template: InvitationTemplate }) {
  return (
    <section
      style={{
        padding: "9cqw 8cqw",
        textAlign: "center",
        borderTop: `0.3cqw solid ${template.palette.soft}`,
      }}
    >
      <h4 style={{ ...display, fontSize: "6.4cqw", fontWeight: 600, marginBottom: "3cqw" }}>{title}</h4>
      <div style={{ fontSize: "3.8cqw", lineHeight: 1.6, opacity: 0.88 }}>{children}</div>
    </section>
  );
}

export function InvitationPreview({ template, variant = "card", className = "" }: Props) {
  const { palette: p, sample } = template;
  const root: CSSProperties = { background: p.bg, color: p.ink, containerType: "inline-size" };

  if (variant === "card") {
    if (template.previewImage) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={template.previewImage} alt={`Mẫu thiệp ${template.name}`} className={`aspect-[3/4] w-full object-cover ${className}`} />
      );
    }
    return (
      <div role="img" aria-label={`Bản xem trước mẫu thiệp ${template.name}`} className={`aspect-[3/4] w-full overflow-hidden ${className}`} style={root}>
        <Cover template={template} tall={false} />
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} style={root}>
      <Cover template={template} tall />
      <Block title="Lời mời" template={template}>
        <p>{sample.message}</p>
      </Block>
      <Block title="Thời gian" template={template}>
        <p style={{ fontWeight: 600 }}>{sample.date}</p>
        <p>Lúc {sample.time}</p>
      </Block>
      <Block title="Địa điểm" template={template}>
        <p style={{ fontWeight: 600 }}>{sample.place}</p>
        <p>{sample.address}</p>
      </Block>
      <section style={{ padding: "9cqw 8cqw 14cqw", textAlign: "center", borderTop: `0.3cqw solid ${p.soft}` }}>
        <div
          style={{
            display: "inline-block",
            background: p.accent,
            color: p.bg,
            fontSize: "4cqw",
            fontWeight: 600,
            padding: "3.2cqw 8cqw",
            borderRadius: "999px",
          }}
        >
          Xác nhận tham dự
        </div>
      </section>
    </div>
  );
}