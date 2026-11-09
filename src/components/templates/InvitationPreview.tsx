import type { CSSProperties, ReactNode } from "react";
import {
  orientationRatio,
  ORIENTATION_LABEL,
  type FaceElement,
  type InvitationTemplate,
} from "@/lib/templates";

type Props = {
  template: InvitationTemplate;
  /** card: chỉ trang bìa, tỉ lệ 3:4. full: toàn bộ thiệp dạng trang dài (dùng trong khung điện thoại) */
  variant?: "card" | "full";
  /** portrait: 3:4 (mặc định, trang mẫu thiệp). tall: 5:7 (thiệp trong studio). square: vuông. */
  ratio?: "portrait" | "tall" | "square";
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

/* ---- Thiệp 2 mặt (format = card) ----
 * Mỗi phần tử có toạ độ theo tỉ lệ (0..1) nên thiệp co giãn đúng theo khung và kiểu dáng (ngang / vuông / dọc).
 * Cỡ chữ tính bằng cqw theo chiều rộng mặt thiệp, giống các mẫu khác. */
const TEXT_FONT: Record<NonNullable<FaceElement["font"]>, string> = {
  display: "var(--font-tpl-display), Georgia, serif",
  body: "var(--font-tpl-ui), system-ui, sans-serif",
  script: "'Dancing Script', 'Brush Script MT', cursive",
};

function roleColor(role: FaceElement["color"] | undefined, p: InvitationTemplate["palette"]): string {
  switch (role) {
    case "accent": return p.accent;
    case "soft": return p.soft;
    case "bg": return p.bg;
    default: return p.ink;
  }
}

function FaceElementView({ el, p }: { el: FaceElement; p: InvitationTemplate["palette"] }) {
  const box: CSSProperties = {
    position: "absolute",
    left: `${el.x * 100}%`,
    top: `${el.y * 100}%`,
    width: `${el.w * 100}%`,
    height: `${el.h * 100}%`,
  };

  if (el.kind === "shape") {
    const c = roleColor(el.fill ?? "soft", p);
    if (el.shape === "frame") return <div aria-hidden style={{ ...box, border: `0.4cqw solid ${c}` }} />;
    if (el.shape === "arch") return <div aria-hidden style={{ ...box, background: c, borderRadius: "999px 999px 0 0" }} />;
    if (el.shape === "circle") return <div aria-hidden style={{ ...box, background: c, borderRadius: "50%" }} />;
    return <div aria-hidden style={{ ...box, background: c }} />;
  }

  return (
    <div
      style={{
        ...box,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        textAlign: el.align ?? "center",
        fontFamily: TEXT_FONT[el.font ?? "body"],
        fontSize: `${(el.sz ?? 0.03) * 100}cqw`,
        fontWeight: el.bold ? 700 : 400,
        fontStyle: el.italic ? "italic" : "normal",
        color: roleColor(el.color, p),
        lineHeight: 1.25,
        whiteSpace: "pre-line",
      }}
    >
      {el.text}
    </div>
  );
}

function CardFace({ template, face }: { template: InvitationTemplate; face: "front" | "back" }) {
  const p = template.palette;
  const orientation = template.orientation ?? "portrait";
  return (
    <div
      role="img"
      aria-label={`${face === "front" ? "Mặt trước" : "Mặt sau"} thiệp ${template.name}`}
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: orientationRatio(orientation),
        background: face === "front" ? p.bg : p.soft,
        color: p.ink,
        containerType: "inline-size",
      }}
    >
      {(template.layout?.[face] ?? []).map((el, i) => (
        <FaceElementView key={i} el={el} p={p} />
      ))}
    </div>
  );
}

function CardPreview({ template, variant, className }: { template: InvitationTemplate; variant: "card" | "full"; className: string }) {
  const orientation = template.orientation ?? "portrait";
  if (variant === "card") {
    if (template.previewImage) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={template.previewImage}
          alt={`Mẫu thiệp ${template.name}`}
          className={`w-full object-cover ${className}`}
          style={{ aspectRatio: orientationRatio(orientation) }}
        />
      );
    }
    return (
      <div className={`w-full ${className}`}>
        <CardFace template={template} face="front" />
      </div>
    );
  }
  // full: hiện cả hai mặt, mặt trước trên, mặt sau dưới
  return (
    <div className={`flex w-full flex-col gap-[4%] ${className}`} aria-label={`${ORIENTATION_LABEL[orientation]}, hai mặt`}>
      <p className="text-xs text-[#5B6B7F]">Mặt trước · {ORIENTATION_LABEL[orientation]}</p>
      <CardFace template={template} face="front" />
      <p className="text-xs text-[#5B6B7F]">Mặt sau</p>
      <CardFace template={template} face="back" />
    </div>
  );
}

export function InvitationPreview({ template, variant = "card", ratio = "portrait", className = "" }: Props) {
  // Thiệp 2 mặt: kiểu dáng quyết định tỉ lệ, không dùng ratio của prop
  if (template.format === "card" && template.layout) {
    return <CardPreview template={template} variant={variant} className={className} />;
  }

  const { palette: p, sample } = template;
  const ratioCls = ratio === "square" ? "aspect-square" : ratio === "tall" ? "aspect-[5/7]" : "aspect-[3/4]";
  const root: CSSProperties = { background: p.bg, color: p.ink, containerType: "inline-size" };

  if (variant === "card") {
    if (template.previewImage) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={template.previewImage} alt={`Mẫu thiệp ${template.name}`} className={`${ratioCls} w-full object-cover ${className}`} />
      );
    }
    return (
      <div role="img" aria-label={`Bản xem trước mẫu thiệp ${template.name}`} className={`${ratioCls} w-full overflow-hidden ${className}`} style={root}>
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