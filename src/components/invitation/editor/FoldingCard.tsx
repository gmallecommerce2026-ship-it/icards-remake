// src/components/invitation/editor/FoldingCard.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { PAGE } from '../envelope/envelope.data';
import { PageEditor } from './PageEditor';
import { useEditorStore } from './useEditorStore';
import c from './FoldingCard.module.css';

/** Lấp đầy khung cha, tự scale từ hệ thiết kế 500×700. open=true: bìa lật mở sang trái. */
export function FoldingCard({ open, editable }: { open: boolean; editable: boolean }) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const [k, setK] = useState(1);
  const [busy, setBusy] = useState(false);
  const rotY = useMotionValue(open ? -180 : 0);
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

  const canEdit = editable && !busy;

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0 }}>
      <div className={c.stage} style={{ transform: `scale(${k})` }}>
        {/* Ruột thiệp (nằm dưới) */}
        <div className={c.sheet} data-editable={canEdit && open} style={{ background: insideBg }}>
          <PageEditor pageId="inside" editable={canEdit && open} />
        </div>

        {/* Bìa: lật quanh gáy bên trái */}
        <motion.div className={c.cover} style={{ rotateY: rotY }}>
          <div className={c.face} data-editable={canEdit && !open} style={{ background: coverBg }}>
            <PageEditor pageId="cover" editable={canEdit && !open} />
          </div>
          <div className={`${c.face} ${c.back}`} />
        </motion.div>
      </div>
    </div>
  );
}