"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EnvelopeSealStage } from "./EnvelopeSealStage";
import { EVENT_FONT_VARS, EventDetailsEditor, type EventDetailsEditorProps } from "./EventDetailsEditor";

/* ------------------------------------------------------------------ */
/*  Bấm "Tiếp theo" ở editor → mở lớp phủ toàn màn hình:               */
/*   1) phần trên: thiệp xoay ngang, nhét khít vào phong bì, nắp đóng   */
/*   2) khi nắp đóng xong → tự cuộn xuống phần cấu hình thiệp online    */
/*  Trong lúc chạy hiệu ứng, khoá cuộn tay; xong mới mở khoá.           */
/* ------------------------------------------------------------------ */

export type InvitationSendFlowProps = Pick<EventDetailsEditorProps, "initial" | "guests" | "onSave" | "onAddGuests"> & {
  open: boolean;
  /** mặt ngoài của thiệp (đặt sẵn `absolute inset-0`) - thường là <CardFaceStatic /> */
  card: ReactNode;
  /** cao / rộng của thiệp (500×700 → 1.4) */
  cardAspect?: number;
  /** màu + lớp lót phong bì người dùng đã chọn trong editor */
  envelopeColor?: string;
  liner?: string;
  onClose: () => void;
};

export function InvitationSendFlow({ open, onClose, ...rest }: InvitationSendFlowProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="send-flow"
          className="fixed inset-0 z-[100] bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <FlowBody onClose={onClose} {...rest} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FlowBody({ card, cardAspect, envelopeColor, liner, initial, guests, onSave, onAddGuests, onClose }: Omit<InvitationSendFlowProps, "open">) {
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [locked, setLocked] = useState(true);
  const [runKey, setRunKey] = useState(0);

  // khoá cuộn trang phía sau editor
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(unlockTimer.current);
    };
  }, []);

  const goToDetails = () => {
    const sc = scrollRef.current;
    if (!sc) return;
    // phần hiệu ứng cao đúng bằng một màn hình → phần cấu hình bắt đầu ở clientHeight
    sc.scrollTo({ top: sc.clientHeight, behavior: reduce ? "auto" : "smooth" });
    // mở khoá cuộn tay SAU khi cuộn xong (đổi overflow giữa chừng có thể làm đứt cuộn mượt)
    unlockTimer.current = setTimeout(() => setLocked(false), reduce ? 0 : 900);
  };

  const replay = () => {
    clearTimeout(unlockTimer.current);
    setLocked(true);
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
    setRunKey((k) => k + 1);
  };

  return (
    <div
      ref={scrollRef}
      className={`absolute inset-0 overscroll-contain ${locked ? "overflow-y-hidden" : "overflow-y-auto"} ${EVENT_FONT_VARS}`}
    >
      <div className="h-full">
        <EnvelopeSealStage
          cardAspect={cardAspect}
          envelopeColor={envelopeColor}
          liner={liner}
          runKey={runKey}
          onSealed={goToDetails}
          onBack={onClose}
        >
          {card}
        </EnvelopeSealStage>
      </div>

      <section className="relative min-h-full">
        <EventDetailsEditor
          initial={initial}
          guests={guests}
          onSave={onSave}
          onAddGuests={onAddGuests}
          onClose={onClose}
          onReplay={replay}
        />
      </section>
    </div>
  );
}
