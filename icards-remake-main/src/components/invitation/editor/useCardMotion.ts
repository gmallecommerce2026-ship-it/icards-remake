// src/components/invitation/editor/useCardMotion.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, useMotionValue, useTransform, type MotionValue } from 'motion/react';
import type { PageId } from './useEditorStore';

/**
 * MỘT giá trị duy nhất `pos` điều khiển cả việc mở bìa lẫn lật thiệp, nên kéo tay (scrub) và chạy tự động
 * dùng chung một hệ:
 *   pos 0 ─────── 1 ─────── 1.5 ─────── 2
 *   bìa đóng   mở hẳn    khép bìa     lật sang mặt sau
 * Các trang dừng ở: cover = 0 · inside = 1 · back = 2
 */
export const STOPS: Record<PageId, number> = { cover: 0, insideLeft: 1, inside: 1, back: 2 };
export const VIEW_AT: PageId[] = ['cover', 'inside', 'back'];

export type CardMotion = {
  pos: MotionValue<number>;
  open: MotionValue<number>;   // 0 = bìa đóng · 1 = bìa mở hẳn
  turn: MotionValue<number>;   // 0 = mặt trước · 1 = mặt sau
  busy: boolean;
  snap: (v: PageId) => void;   // chạy mượt tới một trang (dùng sau khi thả tay)
};

const sm = (x: number) => {
  const u = Math.min(1, Math.max(0, x));
  return u * u * (3 - 2 * u);
};

export function useCardMotion(view: PageId): CardMotion {
  // Hiệu ứng là tính năng cốt lõi của thiệp: luôn chạy, kể cả khi hệ điều hành bật "giảm chuyển động"
  // (trước đây reduce=true làm mọi animation có duration 0 nên hai vật nhảy thẳng sang vị trí mới)
  const reduce = false;
  const pos = useMotionValue(STOPS[view]);
  const [busy, setBusy] = useState(false);
  const ctl = useRef<ReturnType<typeof animate> | null>(null);

  const open = useTransform(pos, (p) => (p <= 1 ? sm(p) : p <= 1.5 ? 1 - sm((p - 1) * 2) : 0));
  const turn = useTransform(pos, (p) => (p <= 1.5 ? 0 : sm((p - 1.5) * 2)));

  const snap = useCallback((v: PageId) => {
    ctl.current?.stop();
    const to = STOPS[v];
    const dist = Math.abs(pos.get() - to);
    if (dist < 0.001 || reduce) { pos.set(to); setBusy(false); return; }
    setBusy(true);
    ctl.current = animate(pos, to, {
      duration: Math.max(0.5, 1.25 * dist),
      ease: 'linear', // độ mềm do smoothstep của open/turn đảm nhiệm: khép bìa xong → dừng nhẹ → mới lật
      onComplete: () => setBusy(false),
    });
  }, [pos, reduce]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    snap(view);
    return () => ctl.current?.stop();
  }, [view, snap]);

  return { pos, open, turn, busy, snap };
}