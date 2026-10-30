// src/components/invitation/editor/FoldingCard.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { PAGE } from '../envelope/envelope.data';
import { PageEditor } from './PageEditor';
import { useEditorStore } from './useEditorStore';
import c from './FoldingCard.module.css';

/** Lấp đầy khung cha, tự scale từ hệ thiết kế 500×700. open=true: bìa lật mở sang trái. */
export function FoldingCard({ open, editable, flipped = false }: { open: boolean; editable: boolean; flipped?: boolean }) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const firstTurn = useRef(true);
  const [k, setK] = useState(1);
  const [busy, setBusy] = useState(false);
  const rotY = useMotionValue(open ? -180 : 0);
  const turn = useMotionValue(flipped ? 180 : 0);          // lật cả tấm thiệp để xem mặt sau
  const frontAlpha = useTransform(turn, (v) => (v < 90 ? 1 : 0));
  const backAlpha = useTransform(turn, (v) => (v < 90 ? 0 : 1));
  const shine = useTransform(turn, (v) => 0.35 * Math.abs(Math.sin((v * Math.PI) / 90)));
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

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setBusy(true);
    const a = animate(rotY, open ? -180 : 0, {
      duration: reduce ? 0 : 1.1,
      ease: [0.6, 0, 0.2, 1],
      onComplete: () => setBusy(false),
    });
    return () => a.stop();
  }, [open, reduce, rotY]);

  useEffect(() => {
    if (firstTurn.current) { firstTurn.current = false; return; }
    const a = animate(turn, flipped ? 180 : 0, {
      duration: reduce ? 0 : 1,
      ease: [0.45, 0, 0.2, 1],
      onComplete: () => setBusy(false),
    });
    setBusy(true);
    return () => a.stop();
  }, [flipped, reduce, turn]);

  const canEdit = editable && !busy;

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0 }}>
      <div className={c.stage} style={{ transform: `scale(${k})` }}>
        <motion.div className={c.flipper} style={{ rotateY: turn }}>
          {/* Mặt trước + ruột thiệp */}
          <motion.div className={c.front} style={{ opacity: frontAlpha, pointerEvents: flipped ? 'none' : 'auto' }}>
            {/* Ruột thiệp (nằm dưới) */}
            <div className={c.sheet} data-editable={canEdit && open && !flipped} style={{ background: insideBg }}>
              <PageEditor pageId="inside" editable={canEdit && open && !flipped} />
            </div>

            {/* Bìa: lật quanh gáy bên trái */}
            <motion.div className={c.cover} style={{ rotateY: rotY }}>
              <div className={c.face} data-editable={canEdit && !open && !flipped} style={{ background: coverBg }}>
                <PageEditor pageId="cover" editable={canEdit && !open && !flipped} />
              </div>
              <div className={`${c.face} ${c.back}`} />
            </motion.div>
          </motion.div>

          {/* Mặt sau của thiệp */}
          <motion.div className={c.rear} style={{ opacity: backAlpha, pointerEvents: flipped ? 'auto' : 'none' }}>
            <div className={c.sheet} data-editable={canEdit && flipped} style={{ background: backBg }}>
              <PageEditor pageId="back" editable={canEdit && flipped} />
            </div>
          </motion.div>

          {/* Ánh sáng lướt qua khi lật */}
          <motion.div className={c.shine} style={{ opacity: shine }} />
        </motion.div>
      </div>
    </div>
  );
}