"use client";

import { useEnvelopeCatalog } from "@/lib/envelope-catalog";
import type { InvitationTemplate } from "@/lib/templates";
import { InvitationPreview } from "./InvitationPreview";

/* Cụm thiệp + phong bì dùng chung cho trang chủ (mẫu nổi bật) và trang mẫu thiệp.
 * Tỉ lệ theo ảnh mẫu, tính bằng % của khung vuông:
 *  - Thiệp 5:7 (đứng), rộng 40%.
 *  - Phong bì vừa đủ để thiệp xoay ngang rồi đút vào: rộng = cạnh dài thiệp + 2 lề, cao = cạnh ngắn thiệp + 2 lề.
 *  - Thiệp đứng trước, che nửa chiều rộng và gần hết chiều cao phong bì; nắp mở để lộ lớp lót (hình tam giác).
 * Cả cụm được căn giữa trong khung. */
const CARD_W = 40;
const CARD_H = (CARD_W * 7) / 5; // 56
const M = 2.5;                   // lề mỗi bên của phong bì
const ENV_W = CARD_H + 2 * M;    // 61
const ENV_H = CARD_W + 2 * M;    // 45

// Toạ độ tương đối với góc trên-trái của phong bì
const CARD_X = ENV_W / 2 - CARD_W;             // thiệp che nửa chiều rộng phong bì
const CARD_Y = ENV_H - ENV_H * 0.1 - CARD_H;   // đáy thiệp cách đáy phong bì 10% chiều cao
const BOX_W = ENV_W - CARD_X;
const BOX_H = ENV_H - CARD_Y;
const ORIGIN_X = (100 - BOX_W) / 2 - CARD_X;   // căn giữa cụm
const ORIGIN_Y = (100 - BOX_H) / 2 - CARD_Y;

const FLAP_OUTER = "polygon(0% 0%, 100% 0%, 50% 68%)";
const FLAP_INNER = "polygon(3% 0%, 97% 0%, 50% 58%)";
const DEFAULT_ENV = { envId: "burgundy", linerId: "ink" };

export function TemplateShowcase({ template }: { template: InvitationTemplate }) {
  const catalog = useEnvelopeCatalog();
  const env =
    catalog.envelopes.find((e) => e.id === (template.envelope?.envId ?? DEFAULT_ENV.envId)) ?? catalog.envelopes[0];
  const liner =
    catalog.liners.find((l) => l.id === (template.envelope?.linerId ?? DEFAULT_ENV.linerId)) ?? catalog.liners[0];

  return (
    <div className="relative aspect-square w-full">
      {/* Phong bì (nằm sau): thân, nắp mở (tam giác) và lớp lót bên trong nắp */}
      <div
        aria-hidden
        className="absolute transition-transform duration-500 group-hover:translate-y-1"
        style={{ left: `${ORIGIN_X}%`, top: `${ORIGIN_Y}%`, width: `${ENV_W}%`, height: `${ENV_H}%` }}
      >
        <div className="absolute inset-0 rounded-[2px] shadow-[0_12px_24px_-12px_rgba(0,0,0,0.5)]" style={{ background: env.color }} />
        <div className="absolute inset-0" style={{ background: env.color, filter: "brightness(1.12)", clipPath: FLAP_OUTER }} />
        <div className="absolute inset-0" style={{ background: liner.background, clipPath: FLAP_INNER }} />
      </div>

      {/* Thiệp (nằm trước), tỉ lệ 5:7 như trong studio */}
      <div
        className="absolute z-10 overflow-hidden rounded-[3px] bg-white shadow-[0_8px_20px_-8px_rgba(14,27,44,0.4)] ring-1 ring-[#0E1B2C]/10 transition-transform duration-500 group-hover:-translate-y-1"
        style={{ left: `${ORIGIN_X + CARD_X}%`, top: `${ORIGIN_Y + CARD_Y}%`, width: `${CARD_W}%` }}
      >
        <InvitationPreview template={template} ratio="tall" />
      </div>
    </div>
  );
}
