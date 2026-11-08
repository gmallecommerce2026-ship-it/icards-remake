"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";
import { EnvelopeScene } from "@/components/invitation/envelope/EnvelopeScene";
import { ENVELOPES, LINERS } from "@/components/invitation/envelope/envelope.data";
import { STAMPS } from "@/components/invitation/envelope/Stamp";
import { CardFaceStatic } from "@/components/invitation/editor/CardFaceStatic";
import { EVENT_FONT_VARS } from "@/components/invitation-send/EventDetailsEditor";

/** Cùng nền và chiều cao vùng ghim với luồng gửi thiệp trong studio */
const TRACK_VH = 400;
const STAGE_BG = "linear-gradient(to bottom, #454547 0%, #1c1c1c 55%, #000 100%)";

/**
 * Cảnh phong bì 3D ở đầu trang thiệp công khai. Tiến độ = vị trí cuộn của TRANG (cửa sổ),
 * cùng bộ lò xo với InvitationSendFlow. Phần sau vùng ghim cuộn bình thường tới nội dung thiệp.
 */
export function PublicEnvelopeIntro() {
  const trackRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.7, restDelta: 0.0003, restSpeed: 0.002 });
  const hint = useTransform(p, [0, 0.04], [1, 0]);

  return (
    <section ref={trackRef} className={`relative ${EVENT_FONT_VARS}`} style={{ height: `${TRACK_VH}dvh` }}>
      <div className="sticky top-0 h-dvh w-full overflow-hidden" style={{ background: STAGE_BG }}>
        <div className="absolute inset-0">
          <EnvelopeScene
            card={<CardFaceStatic pageId="cover" />}
            envelopeColor={ENVELOPES[0].color}
            liner={LINERS[0].background}
            stampId={STAMPS[0].id}
            side="back"
            flapOpen
            cardFront
            focus="card"
            send={p}
          />
        </div>
        <motion.div
          aria-hidden
          style={{ opacity: hint }}
          className="pointer-events-none absolute inset-x-0 bottom-[8dvh] z-20 flex flex-col items-center gap-1 text-center text-white"
        >
          <p className="text-base italic">Cuộn để mở thiệp</p>
          <ArrowDown className="size-5 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
