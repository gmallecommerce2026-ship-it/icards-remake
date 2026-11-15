// src/components/invitation/editor/CardFlatEditor.tsx
'use client';

import { useEffect, useRef, useState, type Ref } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { PageEditor } from './PageEditor';
import { useEditorStore, type PageId } from './useEditorStore';

type Props = {
  view: PageId;            // 'back' = mặt sau, còn lại = mặt trước
  editable: boolean;
  onFlip: () => void;      // đổi sang mặt còn lại (do EnvelopeDesigner giữ trạng thái trang)
  rootRef?: Ref<HTMLDivElement>;   // để EnvelopeDesigner đo khung thiệp
};

/**
 * Thiệp 2 mặt phẳng (format = card): hai mặt, lật quanh trục giữa như cầm tấm thiệp trên tay.
 * Khổ lấy từ store (ngang / vuông / dọc), không dùng khung gập 5:7 và không có phong bì.
 */
export function CardFlatEditor({ view, editable, onFlip, rootRef }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  const dims = useEditorStore((s) => s.dims);
  const frontBg = useEditorStore((s) => s.backdrops.cover);
  const backBg = useEditorStore((s) => s.backdrops.back);
  const reduce = false;   // luôn lật 3D, giống EnvelopeScene (không tắt theo cài đặt giảm chuyển động của hệ điều hành)

  // góc xoay (độ): 0 = mặt trước, 180 = mặt sau
  const turn = useMotionValue(view === 'back' ? 180 : 0);
  const backRot = useTransform(turn, (v) => v + 180);
  // tấm thiệp nhích lên khi đang lật, rồi hạ xuống (không dùng khi người dùng bật giảm chuyển động)
  const lift = useTransform(turn, [0, 90, 180], [0, -14, 0]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setK(e.contentRect.width / dims.w));
    ro.observe(el);
    return () => ro.disconnect();
  }, [dims.w]);

  useEffect(() => {
    const target = view === 'back' ? 180 : 0;
    if (reduce) { turn.set(target); return; }
    const c = animate(turn, target, { duration: 0.9, ease: [0.22, 0.61, 0.36, 1] });
    return () => c.stop();
  }, [view, reduce, turn]);

  const isBack = view === 'back';
  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative',
        width: `min(100%, calc(min(100dvh - 210px, 900px) * ${dims.w} / ${dims.h}))`,
        aspectRatio: `${dims.w} / ${dims.h}`,
        perspective: 1600,
      }}
    >
      <motion.div ref={box} style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', y: reduce ? 0 : lift }}>
        <motion.div
          style={{ position: 'absolute', inset: 0, rotateY: turn, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <Face pageId="cover" k={k} dims={dims} bg={frontBg} editable={editable && !isBack} />
        </motion.div>
        <motion.div
          style={{ position: 'absolute', inset: 0, rotateY: backRot, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <Face pageId="back" k={k} dims={dims} bg={backBg} editable={editable && isBack} />
        </motion.div>
      </motion.div>

      <button
        type="button"
        onClick={onFlip}
        aria-label={isBack ? 'Xem mặt trước' : 'Xem mặt sau'}
        style={{
          position: 'absolute', right: 8, bottom: -44, zIndex: 5,
          padding: '6px 14px', borderRadius: 999, border: '1px solid #d6dbe4', background: '#fff',
          fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(14,27,44,.12)',
        }}
      >
        {isBack ? 'Xem mặt trước' : 'Xem mặt sau'}
      </button>
    </div>
  );
}

function Face({ pageId, k, dims, bg, editable }: { pageId: PageId; k: number; dims: { w: number; h: number }; bg: string; editable: boolean }) {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, overflow: 'hidden', background: bg, borderRadius: 3,
        boxShadow: '0 10px 26px -12px rgba(14,27,44,.45)', outline: '1px solid rgba(14,27,44,.08)',
      }}
    >
      <div
        style={{
          position: 'absolute', left: 0, top: 0, width: dims.w, height: dims.h,
          transformOrigin: '0 0', transform: `scale(${k || 1})`, visibility: k ? 'visible' : 'hidden',
        }}
      >
        <PageEditor pageId={pageId} editable={editable} />
      </div>
    </div>
  );
}
