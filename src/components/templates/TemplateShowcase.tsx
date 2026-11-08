"use client";

import { useEnvelopeCatalog } from "@/lib/envelope-catalog";
import type { InvitationTemplate } from "@/lib/templates";
import { InvitationPreview } from "./InvitationPreview";

/* Cụm thiệp + phong bì dùng chung cho trang chủ (mẫu nổi bật) và trang mẫu thiệp.
 * Tỉ lệ theo ảnh mẫu, tính bằng % của khung vuông:
 *  - Thiệp 3:4 (đứng), rộng 40%.
 *  - Phong bì vừa đủ để thiệp xoay ngang rồi đút vào: rộng = cạnh dài thiệp + 2 lề, cao = cạnh ngắn thiệp + 2 lề.
 *  - Thiệp đứng trước, che nửa chiều rộng và gần hết chiều cao phong bì; nắp mở để lộ lớp lót (hình tam giác).
 * Cả cụm được căn giữa trong khung. */
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

export function TemplateShowcase({ template }: { template: InvitationTemplate }) {
  const catalog = useEnvelopeCatalog();
  const env =
    catalog.envelopes.find((e) => e.id === (template.envelope?.envId ?? DEFAULT_ENV.envId)) ?? catalog.envelopes[0];
  const liner =
    catalog.liners.find((l) => l.id === (template.envelope?.linerId ?? DEFAULT_ENV.linerId)) ?? catalog.liners[0];

  return (
    <div className="relative aspect-square w-full">
      {/* Phong bì (nằm sau): thân, và nắp mở dựng lên phía trên miệng phong bì.
          Mặt nắp quay ra trước là lớp lót (hoạ tiết), viền ngoài là màu phong bì. */}
      <div
        aria-hidden
        className="absolute"
        style={{ left: `${ORIGIN_X}%`, top: `${ORIGIN_Y}%`, width: `${ENV_W}%`, height: `${ENV_H}%` }}
      >
        <div className="absolute inset-0 rounded-[2px] shadow-[0_12px_24px_-12px_rgba(0,0,0,0.5)]" style={{ background: env.color }} />
        {/* Mặt lót nằm ngược (đỉnh chĩa xuống) ở phần trên thân, nhìn thấy qua miệng phong bì đang mở */}
        <div className="absolute inset-0" style={{ background: liner.background, clipPath: BODY_LINER_CLIP }} />
        <div className="absolute left-0 right-0" style={{ bottom: "100%", height: `${(FLAP_H / ENV_H) * 100}%` }}>
          <div className="absolute inset-0" style={{ background: env.color, filter: "brightness(1.08)", clipPath: FLAP_CLIP }} />
          <div
            className="absolute"
            style={{ left: "7%", right: "7%", bottom: 0, top: "16%", background: liner.background, clipPath: FLAP_CLIP }}
          />
        </div>
      </div>

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
