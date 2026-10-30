// src/components/invitation/editor/FoldingCard.tsx
'use client';

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { motion, useTransform } from 'motion/react';
import { PAGE } from '../envelope/envelope.data';
import { PageEditor } from './PageEditor';
import { useEditorStore, type PageId } from './useEditorStore';
import { VIEW_AT, type CardMotion } from './useCardMotion';
import c from './FoldingCard.module.css';

type Props = {
  cm: CardMotion;            // open / turn do useCardMotion điều phối
  view: PageId;              // trang đang là đích: bìa · trang giữa · mặt sau
  editable: boolean;
  gesture?: boolean;         // cho phép nhấn giữ + kéo để lật trang
  onViewChange?: (v: PageId) => void;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Lấp đầy khung cha, tự scale từ hệ thiết kế 500×700. */
export function FoldingCard({ cm, view, editable, gesture = false, onViewChange }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  const [dragging, setDragging] = useState(false);
  const backBg = useEditorStore((s) => s.backdrops.back);
  const coverBg = useEditorStore((s) => s.backdrops.cover);
  const insideBg = useEditorStore((s) => s.backdrops.inside);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setK(e.contentRect.width / PAGE.w));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { open, turn } = cm;
  const canEdit = editable && !cm.busy && !dragging;

  // ---- Bìa lật quanh gáy trái
  const coverRot = useTransform(open, (v) => -180 * v);
  // bìa tối dần về phía gáy khi dựng lên (mặt ngoài tới 90°, mặt trong sau 90°)
  const shadeOut = useTransform(open, [0, 0.5], [0, 0.55]);
  const shadeIn = useTransform(open, [0.5, 1], [0.45, 0]);
  // bóng do chính cái bìa đang lật đổ xuống trang giữa
  const castShadow = useTransform(open, [0, 0.45, 1], [0, 1, 0]);
  // trang trong chỉ được vẽ khi bìa đã hé: bìa đóng thì ẩn hẳn để chữ không lộ xuyên qua bìa (hai lớp đồng phẳng)
  const insideVis = useTransform(open, (v) => (v > 0.002 ? 'visible' : 'hidden'));

  // ---- Lật cả tấm thiệp để xem mặt sau: xoay + nhích lên + nghiêng nhẹ như cầm trên tay
  const turnDeg = useTransform(turn, (v) => 180 * v);
  const frontAlpha = useTransform(turnDeg, (v) => (v < 90 ? 1 : 0));
  const backAlpha = useTransform(turnDeg, (v) => (v < 90 ? 0 : 1));
  const shine = useTransform(turn, (v) => 0.4 * Math.abs(Math.sin(Math.PI * v)));
  const pop = useTransform(turn, (v) => 1 + 0.07 * Math.sin(Math.PI * v));
  const tilt = useTransform(turn, (v) => -7 * Math.sin(Math.PI * v));
  const hop = useTransform(turn, (v) => -16 * Math.sin(Math.PI * v));

  const showFront = view !== 'back';
  const editCover = canEdit && view === 'cover';
  const editInside = canEdit && view === 'inside';
  const editBack = canEdit && view === 'back';

  /* ---- Nhấn giữ + kéo: sang TRÁI để lật tới (bìa → trang giữa → mặt sau), sang PHẢI để lật lùi.
          Thiệp bám theo tay (scrub); thả tay thì tự hoàn tất hoặc quay lại tuỳ theo độ kéo / vận tốc. */
  function onPointerDown(ev: RPointerEvent) {
    if (!gesture || cm.busy) return;
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    const el = box.current;
    if (!el) return;
    const unit = el.getBoundingClientRect().width * 0.75;   // kéo ~75% bề rộng thiệp = một trang
    const sx = ev.clientX, sy = ev.clientY;
    const startPos = cm.pos.get();
    const startIdx = Math.round(startPos);
    let active = false, lastX = sx, lastT = performance.now(), vel = 0;

    const move = (m: PointerEvent) => {
      const dx = m.clientX - sx, dy = m.clientY - sy;
      if (!active) {
        if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy)) return;
        active = true;
        setDragging(true);
        window.getSelection()?.removeAllRanges();
        useEditorStore.getState().select(null);
      }
      const now = performance.now();
      vel = (m.clientX - lastX) / Math.max(1, now - lastT);
      lastX = m.clientX; lastT = now;
      cm.pos.set(clamp(startPos - dx / unit, 0, 2));
    };
    const end = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      if (!active) return;
      setDragging(false);
      const p = cm.pos.get();
      let idx = startIdx;
      if (p > startIdx + 0.2 || vel < -0.5) idx = startIdx + 1;
      else if (p < startIdx - 0.2 || vel > 0.5) idx = startIdx - 1;
      const target = VIEW_AT[clamp(idx, 0, 2)];
      cm.snap(target);
      onViewChange?.(target);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  }

  return (
    <div
      ref={box}
      onPointerDown={onPointerDown}
      onDragStart={(ev) => ev.preventDefault()}
      style={{
        position: 'absolute', inset: 0,
        touchAction: gesture ? 'pan-y' : undefined,
        cursor: gesture ? (dragging ? 'grabbing' : 'grab') : undefined,
        userSelect: 'none', WebkitUserSelect: 'none',
      }}
    >
      <div className={c.stage} style={{ transform: `scale(${k})` }}>
        <motion.div className={c.flipper} style={{ rotateY: turnDeg, rotateX: tilt, scale: pop, y: hop }}>
          {/* Mặt trước + ruột thiệp */}
          <motion.div className={c.front} style={{ opacity: frontAlpha, pointerEvents: showFront ? 'auto' : 'none' }}>
            {/* Ruột thiệp (nằm dưới) */}
            <div className={c.sheet} data-editable={editInside} style={{ background: insideBg }}>
              <motion.div style={{ position: 'absolute', inset: 0, visibility: insideVis }}>
                <PageEditor pageId="inside" editable={editInside} />
              </motion.div>
              <motion.div aria-hidden className={c.cast} style={{ opacity: castShadow }} />
            </div>

            {/* Bìa: lật quanh gáy bên trái - chỉ xoay, không dịch ngang nên không bao giờ tách khỏi ruột */}
            <motion.div className={c.cover} style={{ rotateY: coverRot, z: 1 }}>
              <div className={c.face} data-editable={editCover} style={{ background: coverBg }}>
                <PageEditor pageId="cover" editable={editCover} />
                <motion.div aria-hidden className={c.shadeOut} style={{ opacity: shadeOut }} />
              </div>
              <div className={`${c.face} ${c.back}`}>
                <motion.div aria-hidden className={c.shadeIn} style={{ opacity: shadeIn }} />
              </div>
            </motion.div>
          </motion.div>

          {/* Mặt sau của thiệp */}
          <motion.div className={c.rear} style={{ opacity: backAlpha, pointerEvents: showFront ? 'none' : 'auto' }}>
            <div className={c.sheet} data-editable={editBack} style={{ background: backBg }}>
              <PageEditor pageId="back" editable={editBack} />
            </div>
          </motion.div>

          {/* Ánh sáng lướt qua khi lật */}
          <motion.div className={c.shine} style={{ opacity: shine }} />
        </motion.div>

      </div>
    </div>
  );
}