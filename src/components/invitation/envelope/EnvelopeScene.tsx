// src/components/invitation/envelope/EnvelopeScene.tsx
'use client';

import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import styles from './envelope.module.css';

type Props = {
  children: ReactNode; // nội dung thiệp (ảnh export từ editor hoặc JSX)
  width?: number;
  envelopeColor?: string;
  linerColor?: string;
  onOpened?: () => void;
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function EnvelopeScene({ children, width = 480, envelopeColor = '#d9c7a3', linerColor = '#9c3b2e', onOpened }: Props) {
  const h = width * 0.7;
  const reduce = useReducedMotion();
  const [opened, setOpened] = useState(false);
  const busy = useRef(false);

  // Giá trị chuyển động
  const flapRot = useMotionValue(0);
  const flapZ = useTransform(flapRot, (v) => (v > 90 ? 1 : 5)); // nắp ra sau thiệp khi đã lật quá 90°
  const cardPct = useMotionValue(0);
  const cardY = useTransform(cardPct, (v) => `${v}%`);
  const cardScale = useMotionValue(1);
  const cardZ = useMotionValue(2); // 2 = nằm sau túi phong bì, 6 = nổi lên trước
  const envY = useMotionValue(0);
  const envOpacity = useMotionValue(1);
  const tiltX = useSpring(0, { stiffness: 120, damping: 14 });
  const tiltY = useSpring(0, { stiffness: 120, damping: 14 });

  async function open() {
    if (busy.current || opened) return;
    busy.current = true;
    const k = reduce ? 0 : 1;
    await animate(flapRot, 180, { duration: 0.7 * k, ease: [0.4, 0, 0.2, 1] });
    await animate(cardPct, -58, { duration: 0.7 * k, ease: 'easeOut' });
    cardZ.set(6);
    await Promise.all([
      animate(cardPct, -12, { duration: 0.9 * k, ease: EASE_OUT }),
      animate(cardScale, 1.12, { duration: 0.9 * k, ease: EASE_OUT }),
      animate(envY, h * 0.5, { duration: 0.9 * k, ease: EASE_OUT }),
      animate(envOpacity, 0, { duration: 0.7 * k, delay: 0.2 * k }),
    ]);
    setOpened(true);
    onOpened?.();
  }

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (!opened || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 16);
    tiltX.set(-((e.clientY - r.top) / r.height - 0.5) * 16);
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  }

  const env = { y: envY, opacity: envOpacity };
  const vars = { '--w': `${width}px`, '--h': `${h}px`, '--env': envelopeColor, '--liner': linerColor, marginBlock: `${h * 0.7}px ${h * 0.25}px` } as CSSProperties;

  return (
    <div
      className={styles.scene}
      style={vars}
      data-opened={opened}
      role="button"
      tabIndex={opened ? -1 : 0}
      aria-label={opened ? 'Thiệp mời' : 'Mở phong bì'}
      onClick={open}
      onKeyDown={onKey}
      onPointerMove={onMove}
      onPointerLeave={() => { tiltX.set(0); tiltY.set(0); }}
    >
      <motion.div className={`${styles.part} ${styles.back}`} style={{ ...env, zIndex: 0 }} />
      <motion.div className={styles.flap} style={{ ...env, rotateX: flapRot, transformPerspective: 1200, zIndex: flapZ }}>
        <div className={`${styles.face} ${styles.outside}`} />
        <div className={`${styles.face} ${styles.inside}`} />
      </motion.div>
      <motion.div
        className={styles.card}
        style={{ y: cardY, scale: cardScale, rotateX: tiltX, rotateY: tiltY, transformPerspective: 1200, zIndex: cardZ }}
      >
        {children}
      </motion.div>
      <motion.div className={`${styles.part} ${styles.pocket}`} style={{ ...env, zIndex: 4 }} />
    </div>
  );
}