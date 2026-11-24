"use client";

import { useRef } from "react";
import { PublicEnvelopeIntro, type IntroInfo, type PublicDesign } from "@/components/invitation/public/PublicEnvelopeIntro";
import { EVENT_FONT_VARS, EventDetailsEditor } from "@/components/invitation-send/EventDetailsEditor";
import type { InvitationTemplate } from "@/lib/templates";

export type PreviewDevice = "desktop" | "mobile";

/** Khung giả lập máy tính / điện thoại (không vẽ hình thiết bị thật).
 *  Bên trong là đúng luồng trang xem thiệp công khai: intro phong bì cuộn theo khung,
 *  rồi phần thân thiệp. Cuộn xảy ra trong khung, không cuộn cả trang. */
export function TemplatePreviewScreen({ template, device }: { template: InvitationTemplate; device: PreviewDevice }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const s = template.sample;
  const info: IntroInfo = {
    title: s.titleLines.join(" "),
    description: template.tagline,
    host: "",
    date: s.date,
    time: s.time,
    venue: s.place,
    address: s.address,
  };
  const mobile = device === "mobile";

  return (
    <div
      className={
        mobile
          ? "mx-auto w-[300px] rounded-[2.4rem] bg-[#15151c] p-[9px] shadow-[0_30px_60px_-24px_rgba(15,23,42,.5)]"
          : "w-full overflow-hidden rounded-xl border border-line bg-white shadow-[0_18px_40px_-18px_rgba(15,23,42,.3)]"
      }
    >
      {mobile ? (
        <div aria-hidden className="mx-auto mb-1 h-5 w-24 rounded-b-2xl bg-[#15151c]" />
      ) : (
        <div aria-hidden className="flex h-9 items-center gap-1.5 border-b border-line bg-porcelain px-4">
          <span className="size-2.5 rounded-full bg-[#d6d3dc]" />
          <span className="size-2.5 rounded-full bg-[#d6d3dc]" />
          <span className="size-2.5 rounded-full bg-[#d6d3dc]" />
          <span className="ml-3 truncate rounded-sm bg-white px-3 py-0.5 text-[11px] text-muted">
            icards.com.vn/events/view?id={template.slug}
          </span>
        </div>
      )}

      <div
        ref={scrollRef}
        tabIndex={0}
        aria-label={`Cuộn để xem thiệp ${template.name}`}
        className={`overflow-y-auto overscroll-contain bg-white outline-none ${
          mobile ? "h-[600px] rounded-[1.9rem]" : "h-[660px]"
        }`}
        style={{ scrollbarWidth: "thin" }}
      >
        <PublicEnvelopeIntro info={info} design={template.design as unknown as PublicDesign | undefined} scrollRoot={scrollRef} fitFrame />
        <div className={`${EVENT_FONT_VARS} min-h-full`} style={{ background: "var(--ev-bg)", color: "var(--ev-ink)" }}>
          <EventDetailsEditor readOnly initial={info} initialSettings={{ showRsvp: false, showGuests: false }} />
        </div>
      </div>
    </div>
  );
}
