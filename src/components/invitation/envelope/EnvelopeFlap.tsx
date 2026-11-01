// src/components/invitation/envelope/EnvelopeFlap.tsx
'use client';

import { motion, useTransform, type MotionValue } from 'motion/react';
import s from './envelope.module.css';

/**
 * Nắp phong bì "giấy thật".
 *
 * Thay vì một tấm cứng quay quanh trục X (nhìn chính diện chỉ giống bị co theo chiều dọc),
 * nắp được chia thành N dải giấy nối tiếp nhau bằng bản lề. Mỗi dải:
 *  - quay theo góc của dải cha + một góc uốn nhỏ (`curl`) nên nắp cong mềm khi chuyển động;
 *  - tự tính độ sáng theo góc nghiêng so với nguồn sáng (tối dần khi dựng đứng, loé sáng khi
 *    lật qua ~50°), nên mắt đọc được hình khối.
 *
 * Cái làm nắp trông "3D thật" không chỉ là các dải: nó còn cần
 *  - tâm phối cảnh (perspective-origin) của phong bì hạ THẤP hơn thân phong bì -> khi nắp dựng lên theo
 *    trục z, đỉnh nắp được "nâng" lên màn hình như nhìn từ góc chếch phía trên, thay vì co dẹt thành 1 đường;
 *  - độ uốn `curl` phụ thuộc góc + vận tốc (xem EnvelopeScene) nên giấy oằn khi mở nhanh, rung khi đóng sập.
 *
 * Quy tắc 3D quan trọng: mọi tầng cha của dải phải giữ `transform-style: preserve-3d`, và
 * `clip-path` KHÔNG được đặt trực tiếp lên lớp đang xoay (Chrome sẽ cắt lệch) mà đặt trên
 * phần tử con phẳng `.clipbox` bên trong.
 */

const N = 10;                          // số dải giấy
const SUM = (N * (N - 1)) / 2;         // trọng số uốn tăng dần về phía mũi nắp
export const FLAP_N = N;               // (debug) dùng ở FlapDebugPanel
export const FLAP_SUM = SUM;
const RAD = Math.PI / 180;
const OVERLAP = 1.2;                   // px chồng mép giữa hai dải để không hở đường nối
const LINER_INSET = 2;                 // lề lớp lót (%) - PHẢI bằng lề của `.interior` (clip-path 2% / 98%) để lớp lót nắp và lòng phong bì khớp nhau tại bản lề
const LINER_TIP = 0.88;                // mũi lớp lót (tỉ lệ chiều cao nắp)
const LINER_CLIP = `polygon(${LINER_INSET}% 0, ${100 - LINER_INSET}% 0, 50% ${LINER_TIP * 100}%)`;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Độ tối (0..1) của mặt ngoài / mặt trong nắp theo góc quay (độ). Nguồn sáng từ trên-trước.
const darkOut = (d: number) => {
  const t = d * RAD;
  return clamp((0.85 - (0.5 * Math.sin(t) + 0.85 * Math.cos(t))) * 0.6, 0, 0.5);
};
const darkIn = (d: number) => {
  const t = d * RAD;
  return clamp((0.85 - (-0.5 * Math.sin(t) - 0.85 * Math.cos(t))) * 0.38, 0, 0.45);
};
// Vệt phản chiếu thoáng qua khi mặt ngoài nghiêng ~52° so với ánh sáng
const spec = (d: number) => Math.exp(-(((d - 52) / 20) ** 2)) * 0.22;

const tone = (net: number) => (net > 0 ? `rgb(255 255 255 / ${net})` : `rgb(0 0 0 / ${-net})`);
const toneOut = (d: number) => tone(spec(d) - darkOut(d));
const toneIn = (d: number) => tone(-darkIn(d));

// Cạnh nghiêng của tam giác: x (%) tại độ sâu y, mũi nhọn ở (50%, tip)
const edgeX = (y: number, tip: number, inset: number) => inset + (50 - inset) * (y / tip);

// clip-path (toạ độ % theo hộp của dải) cho phần tam giác nằm trong dải thứ i
function bandClip(i: number, seg: number, tip: number) {
  const y0 = i * seg;
  const y1 = Math.min(y0 + seg + OVERLAP, tip);
  const pct = (y: number) => `${((y - y0) / seg) * 100}%`;
  const xl = edgeX(y0, tip, 0);
  const xr = 100 - xl;
  if (y1 >= tip) return `polygon(${xl}% 0, ${xr}% 0, 50% ${pct(tip)})`;
  const bl = edgeX(y1, tip, 0);
  return `polygon(${xl}% 0, ${xr}% 0, ${100 - bl}% ${pct(y1)}, ${bl}% ${pct(y1)})`;
}

type Ctx = {
  h: number;                 // chiều cao cả nắp (px)
  seg: number;               // chiều cao một dải (px)
  liner: string;             // CSS background lớp lót
  rot: MotionValue<number>;  // góc mở của bản lề (0 = đóng, 180 = mở hẳn)
  curl: MotionValue<number>; // tổng độ uốn từ gốc tới mũi (độ, âm = mũi bị tụt lại phía sau)
  className?: string;        // thêm vào dải gốc (vd. class `hit` để nhận chạm)
  onClick?: () => void;
  visibility?: MotionValue<'visible' | 'hidden'>;
  sheet?: 'back' | 'front';  // (debug) tấm nào chứa nắp này
};

function Skin({ i, inner, ctx }: { i: number; inner: boolean; ctx: Ctx }) {
  const { h, seg, liner, rot, curl } = ctx;
  const cum = (i * (i + 1)) / 2 / SUM;
  // Góc tuyệt đối của dải này = góc bản lề + phần uốn tích luỹ tới nó
  const theta = useTransform([rot, curl], ([r, c]: number[]) => r + c * cum);
  const shade = useTransform(theta, inner ? toneIn : toneOut);
  // nếp gấp chỉ hiện khi nắp đã hé: nắp đóng phải liền một khối với thân, không có vệt sáng/tối ở bản lề
  const creaseOp = useTransform(theta, (d) => clamp((d - 4) / 22, 0, 1));
  const offset = { top: -i * seg, height: h };

  return (
    <div className={inner ? `${s.skin} ${s.skinIn}` : s.skin}>
      <div className={s.clipbox} data-clipbox style={{ clipPath: bandClip(i, seg, h) }}>
        <div className={`${s.skinBody} ${inner ? s.bodyIn : s.bodyOut}`} style={offset} />
        {inner && <div className={s.skinBody} style={{ ...offset, background: liner, clipPath: LINER_CLIP }} />}
        {!inner && i === 0 && <motion.div className={s.crease} style={{ opacity: creaseOp }} />}
        <motion.div className={s.shade} data-shade style={{ backgroundColor: shade }} />
      </div>
    </div>
  );
}

function Strip({ i, ctx }: { i: number; ctx: Ctx }) {
  const { seg, rot, curl, className, onClick, visibility, sheet } = ctx;
  const joint = useTransform(curl, (c) => (c * i) / SUM);
  const style = i === 0 ? { rotateX: rot, z: 2, height: seg, visibility } : { rotateX: joint, height: seg };
  const cls = i === 0 ? (className ? `${s.flap} ${className}` : s.flap) : s.seg;
  return (
    <motion.div
      className={cls}
      style={style}
      onClick={i === 0 ? onClick : undefined}
      data-seg={i}
      data-flap-root={i === 0 ? '' : undefined}
      data-sheet={i === 0 ? sheet : undefined}
    >
      <Skin i={i} inner={false} ctx={ctx} />
      <Skin i={i} inner ctx={ctx} />
      {i < N - 1 && <Strip i={i + 1} ctx={ctx} />}
    </motion.div>
  );
}

export function EnvelopeFlap({ height, liner, rot, curl, className, onClick, visibility, sheet }: {
  height: number;
  liner: string;
  rot: MotionValue<number>;
  curl: MotionValue<number>;
  className?: string;
  onClick?: () => void;
  visibility?: MotionValue<'visible' | 'hidden'>;
  sheet?: 'back' | 'front';
}) {
  return <Strip i={0} ctx={{ h: height, seg: height / N, liner, rot, curl, className, onClick, visibility, sheet }} />;
}