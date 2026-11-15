"use client";

import { useEnvelopeCatalog } from "@/lib/envelope-catalog";
import type { InvitationTemplate } from "@/lib/templates";
import { cardCluster } from "@/components/invitation/envelope/envelope.geometry";
import { InvitationPreview } from "./InvitationPreview";

/* Cụm thiệp + phong bì dùng chung cho trang chủ (mẫu nổi bật) và trang mẫu thiệp.
 *
 * 1) Thiệp gập 5:7 (folding): tỉ lệ theo ảnh mẫu, tính bằng % của khung vuông:
 *  - Thiệp 3:4 (đứng), rộng 40%.
 *  - Phong bì vừa đủ để thiệp xoay ngang rồi đút vào: rộng = cạnh dài thiệp + 2 lề, cao = cạnh ngắn thiệp + 2 lề.
 *  - Thiệp đứng trước, che nửa chiều rộng và gần hết chiều cao phong bì; nắp mở để lộ lớp lót (hình tam giác).
 *
 * 2) Thiệp 2 mặt (card): ngang / vuông / dọc. Phong bì cùng hướng với thiệp và bao vừa khít thiệp + lề
 *    (hình học trong envelope.geometry.ts). Cả cụm được căn giữa trong khung vuông. */

const CARD_W = 46;
const CARD_H = (CARD_W * 4) / 3;   // 61.3
const M = 2;                     // lề mỗi bên của phong bì
const ENV_SCALE = 0.9;           // phong bì gọn hơn một chút so với mức vừa khít
const ENV_W = (CARD_H + 2 * M) * ENV_SCALE;
const ENV_H = (CARD_W + 2 * M) * ENV_SCALE;

// Toạ độ tương đối với góc trên-trái của phong bì
const CARD_X = ENV_W / 2 - CARD_W;             // thiệp che nửa chiều rộng phong bì
const CARD_Y = ENV_H - ENV_H * 0.1 - CARD_H;   // đáy thiệp cách đáy phong bì 10% chiều cao
// Nắp mở lên trên, lật ra khỏi miệng phong bì: cao 60% chiều cao phong bì.
const FLAP_H = ENV_H * 0.6;
const FLAP_CLIP = "polygon(0% 100%, 100% 100%, 50% 0%)";
const BODY_LINER_CLIP = "polygon(4% 0%, 96% 0%, 50% 36%)";
// Cụm gồm cả nắp, nên tính lại khung theo đỉnh nắp (có thể cao hơn đỉnh thiệp)
const TOP_Y = Math.min(CARD_Y, -FLAP_H);
const BOX_W = ENV_W - CARD_X;
const BOX_H = ENV_H - TOP_Y;
const ORIGIN_X = (100 - BOX_W) / 2 - CARD_X;   // căn giữa cụm
const ORIGIN_Y = (100 - BOX_H) / 2 - TOP_Y;

const DEFAULT_ENV = { envId: "burgundy", linerId: "ink" };

type Box = { left: number; top: number; width: number; height: number; flapPct: number };

/** Thân phong bì phía sau thiệp: màu ngoài, lớp lót hình tam giác và nắp mở dựng lên trên miệng. */
function EnvelopeBack({ box, color, linerBg }: { box: Box; color: string; linerBg: string }) {
  return (
    <div
      aria-hidden
      className="absolute"
      style={{ left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, height: `${box.height}%` }}
    >
      <div className="absolute inset-0 rounded-[2px] shadow-[0_12px_24px_-12px_rgba(0,0,0,0.5)]" style={{ background: color }} />
      {/* Mặt lót nằm ngược (đỉnh chĩa xuống) ở phần trên thân, nhìn thấy qua miệng phong bì đang mở */}
      <div className="absolute inset-0" style={{ background: linerBg, clipPath: BODY_LINER_CLIP }} />
      <div className="absolute left-0 right-0" style={{ bottom: "100%", height: `${box.flapPct}%` }}>
        <div className="absolute inset-0" style={{ background: color, filter: "brightness(1.08)", clipPath: FLAP_CLIP }} />
        <div
          className="absolute"
          style={{ left: "7%", right: "7%", bottom: 0, top: "16%", background: linerBg, clipPath: FLAP_CLIP }}
        />
      </div>
    </div>
  );
}

export function TemplateShowcase({ template }: { template: InvitationTemplate }) {
  const catalog = useEnvelopeCatalog();
  const env =
    catalog.envelopes.find((e) => e.id === (template.envelope?.envId ?? DEFAULT_ENV.envId)) ?? catalog.envelopes[0];
  const liner =
    catalog.liners.find((l) => l.id === (template.envelope?.linerId ?? DEFAULT_ENV.linerId)) ?? catalog.liners[0];

  // Thiệp 2 mặt: phong bì cùng hướng với thiệp, thiệp đứng trước và nhô lên khỏi miệng phong bì
  if (template.format === "card") {
    const g = cardCluster(template.orientation ?? "portrait");
    return (
      <div className="relative aspect-square w-full">
        <EnvelopeBack
          box={{ left: g.originX, top: g.originY, width: g.envW, height: g.envH, flapPct: (g.flapH / g.envH) * 100 }}
          color={env.color}
          linerBg={liner.background}
        />
        <div
          className="absolute z-10 overflow-hidden rounded-[3px] shadow-[0_8px_20px_-8px_rgba(14,27,44,0.4)] ring-1 ring-[#0E1B2C]/10 transition-transform duration-500 group-hover:scale-[1.04]"
          style={{ left: `${g.originX + g.cardX}%`, top: `${g.originY + g.cardY}%`, width: `${g.cardW}%` }}
        >
          <InvitationPreview template={template} variant="card" />
        </div>
      </div>
    );
  }

  // Thiệp gập 5:7: giữ nguyên hình học cũ
  return (
    <div className="relative aspect-square w-full">
      <EnvelopeBack
        box={{ left: ORIGIN_X, top: ORIGIN_Y, width: ENV_W, height: ENV_H, flapPct: (FLAP_H / ENV_H) * 100 }}
        color={env.color}
        linerBg={liner.background}
      />

      {/* Thiệp (nằm trước), tỉ lệ 5:7 như trong studio */}
      <div
        className="absolute z-10 overflow-hidden rounded-[3px] bg-white shadow-[0_8px_20px_-8px_rgba(14,27,44,0.4)] ring-1 ring-[#0E1B2C]/10 transition-transform duration-500 group-hover:scale-[1.06]"
        style={{ left: `${ORIGIN_X + CARD_X}%`, top: `${ORIGIN_Y + CARD_Y}%`, width: `${CARD_W}%` }}
      >
        <InvitationPreview template={template} />
      </div>
    </div>
  );
}
