// src/components/invitation/envelope/EnvelopeScene.tsx
'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity, type MotionValue } from 'motion/react';
import { Stamp } from './Stamp';
import { EnvelopeFlap } from './EnvelopeFlap';
import { WaxSeal, SEAL_PRESS_AT } from './WaxSeal';
import { createCamera, type CamKey } from './cinematic';
import { FlapDebugPanel } from './FlapDebugPanel';
import { dbg } from './flapDebug';
import s from './envelope.module.css';

/* ------------------------------------------------------------------ */
/*  Hệ tọa độ thiết kế (px). Cả scene được scale vừa KHUNG CHỨA (cả rộng lẫn cao)  */
/*  và luôn đặt chính giữa. Mọi kích thước phong bì đều suy ra từ kích thước thiệp. */
/* ------------------------------------------------------------------ */
const DW = 720, DH = 700;
const CX = DW / 2, CY = DH / 2;
const CARD_W = 360, CARD_H = 504;                       // thiệp dọc 5:7
const CARD = { x: CX - CARD_W / 2, y: CY - CARD_H / 2, w: CARD_W, h: CARD_H };
const CARD_CX = CX, CARD_CY = CY;

// Phong bì FIT thiệp: thiệp nằm ngang (xoay -90°) với độ phóng S_IN vừa khít miệng phong bì
const S_IN = 0.88;
const ENV_W = Math.round(CARD_H * S_IN + 76);           // cạnh dài thiệp + lề 2 bên
const ENV_H = Math.round(CARD_W * S_IN + 64);           // cạnh ngắn thiệp + lề trên/dưới
const ENV = { x: Math.round(CX - ENV_W / 2), y: Math.round(CY - ENV_H / 2), w: ENV_W, h: ENV_H };
const IN_HALF_H = (CARD_W * S_IN) / 2;                  // nửa chiều cao thiệp khi nằm ngang
const FLAP_H = ENV.h * 0.58;

/* Các tư thế của thiệp, tính theo TÂM thiệp (cx, cy) và độ phóng s.
     sealed : cất kín (nắp đóng)
     peek   : nắp mở, thiệp thò lên khỏi miệng phong bì
     slid   : đã trượt hẳn ra khỏi miệng phong bì (vẫn nằm ngang)
     outClosed / outOpen : đã ra ngoài, đứng dọc trước phong bì (bìa đóng / bìa mở trải hai trang) */
const POSE = {
  sealed: { cx: CX, cy: CY + 6, s: S_IN },
  peek: { cx: CX, cy: ENV.y - 100 + IN_HALF_H, s: S_IN },
  slid: { cx: CX, cy: ENV.y + 20 - IN_HALF_H, s: S_IN },
  outClosed: { cx: 270, cy: 352, s: 1.0 },          // thiệp ở TRƯỚC: lệch trái, phong bì lùi chéo phía sau bên phải
  behind: { cx: 548, cy: 292, s: 0.78 },            // thiệp ở SAU phong bì: chéo phải-trên
  outOpen: { cx: CX + (CARD_W * 0.84) / 2, cy: 340, s: 0.84 },   // bìa mở: cả hai trang cân giữa khung
};

// Phong bì khi thiệp đã rút ra: [thiệp ở trước, phong bì ở trước]
const ENV_LAYOUT = { x: [130, -60], y: [70, 110], s: [0.86, 1] };
const ENV_PUSH = 150;    // phong bì lùi ra sau theo trục z (thiệp luôn ở phía trước)
const T_SLIDE = 0.4;     // mốc của t: thiệp (đang nằm ngang) đã trượt hết khỏi miệng phong bì
const T_TURN = 0.34;     // từ mốc này thiệp bắt đầu xoay dọc + bay vòng cung ra trước
const BOW = -60;         // độ phình của quỹ đạo vòng cung (px, sang trái)
const Z_BUMP = 170;
const ORB_X = 190;       // đổi chỗ kiểu quỹ đạo: tới nửa đường hai vật văng sang 2 bên (thiệp trái, phong bì phải) rồi mới đổi trước/sau
const ORB_DIP = 0.14;    // cả hai lùi xa ~14% ở giữa quỹ đạo -> cảm giác có chiều sâu, không đè nhau lúc hoán đổi z-index
const ORB_YAW = 26;      // xoay quanh trục dọc ngược chiều nhau khi lướt qua
const SWAP_ARC = 70;     // khi đổi chỗ: thiệp nhấc lên, phong bì hạ xuống từng ấy px để hai vật lướt qua nhau không chồng lên nhau

/* "Máy quay" đi theo nội dung: nắp mở / thiệp trượt lên làm cụm cao hơn nên cả cảnh được kéo xuống
   đúng bằng phần lòi ra phía trên, để cụm luôn nằm giữa khung (và không bao giờ bị cắt). */
const PAN_FLAP = CY - (ENV.y - FLAP_H + ENV.y + ENV.h) / 2;
const PAN_SLID = CY - (POSE.slid.cy - IN_HALF_H + ENV.y + ENV.h) / 2;

/* Máy quay của phong bì: tâm phối cảnh hạ THẤP hơn thân phong bì (như nhìn từ góc chếch phía trên).
   Thân phong bì nằm ở z = 0 nên không bị méo; chỉ phần nhô theo trục z (nắp đang dựng) mới được nâng lên màn hình,
   nên nắp đọc được là một tấm giấy đang LẬT LÊN thay vì co dẹt thành một đường. */
const PERSP = 3000;                  // khớp `.stage3d { perspective }` trong envelope.module.css
const PERSP_DROP = ENV.h * 1.2;      // tâm phối cảnh thấp hơn tâm phong bì chừng này (px)
const HINGE_TO_ORIGIN = ENV.h / 2 + PERSP_DROP;
/** độ nâng (px, thiết kế) của mũi nắp so với bản lề tại góc `deg`, khi nhìn mặt nắp */
const flapRise = (deg: number) => {
  const a = (deg * Math.PI) / 180;
  const y = FLAP_H * Math.cos(a), z = FLAP_H * Math.sin(a);
  const f = PERSP / (PERSP - z);
  return -(y * f - HINGE_TO_ORIGIN * (f - 1));
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ss = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};


/* ------------------------------------------------------------------ */
/*  CHẾ ĐỘ "GÓI THIỆP" (prop `send`): chuyển động KHÔNG chạy theo thời gian mà bám theo một MotionValue  */
/*  tiến độ 0 → 1 (thường là tiến độ cuộn trang, như ImmersiveScrollHero). Cuộn xuôi = đút thiệp vào,   */
/*  đóng nắp, xoay ra mặt trước. Cuộn ngược = chạy đúng hành trình ngược lại.                          */
/*  Tại p = 0 cảnh KHỚP TUYỆT ĐỐI với trạng thái chỉnh sửa (thiệp ra ngoài, nắp mở, mặt nắp quay ra).  */
/*  Muốn nhanh / chậm từng đoạn chỉ cần sửa các mốc dưới đây.                                         */
/* ------------------------------------------------------------------ */
export const SEND_RANGE = {
  show: [0.05, 0.26],   // thiệp tiến sát camera, nghiêng nhiều góc để khoe mặt bìa ngoài
  card: [0.26, 0.50],   // thiệp xoay ngang rồi trượt xuống miệng phong bì (t: 1 → 0)
  sink: [0.50, 0.58],   // thiệp hạ hẳn xuống đáy túi (vẫn nhìn thấy qua miệng nắp mở)
  flap: [0.56, 0.74],   // nắp gập xuống (180° → 0°) và nảy nhẹ một nhịp
  seal: [0.75, 0.89],   // sáp loang, con dấu đồng đóng xuống mép niêm phong, để lại dấu iCards
  flip: [0.91, 0.98],   // phong bì xoay ra MẶT TRƯỚC (có tem + tên người nhận)
} as const;

/* Kích thước + vị trí con dấu trên mũi nắp (px thiết kế): tâm đĩa hơi cao hơn mũi để sáp phủ kín đỉnh chữ V */
const SEAL_D = 96;
const SEAL_CY = FLAP_H - SEAL_D * 0.1;          // tâm dấu cao hơn mũi nắp một chút: sáp phủ kín đỉnh chữ V
const SEAL_TOP = SEAL_CY - SEAL_D / 2;

/* GÓC MÁY theo tiến độ p. s = độ phóng · rx/ry/rz = nghiêng/xoay quanh/lắc (độ) · fx,fy = điểm máy nhìn vào (px, từ tâm cảnh)
   Nhịp: tiến nhẹ khi thiệp khoe mặt bìa → lùi toàn cảnh khi thiệp xoay ngang → áp sát miệng phong bì → nhìn chếch
         từ trên khi nắp gập → THẲNG GÓC (top-down) vào mép niêm phong khi đóng dấu → lùi ra, vòng một cung khi lật mặt trước. */
const SEAL_FY = ENV.y + SEAL_CY - CY;
const CAM_KEYS: CamKey[] = [
  { p: 0.00, s: 1.00, rx: 0,  ry: 0,   rz: 0,    fx: 0, fy: 0 },
  { p: 0.05, s: 1.00, rx: 0,  ry: 0,   rz: 0,    fx: 0, fy: 0 },
  { p: 0.12, s: 1.04, rx: -2, ry: 6,   rz: 0.4,  fx: 0, fy: -6 },
  { p: 0.20, s: 1.06, rx: 2,  ry: -6,  rz: -0.4, fx: 0, fy: 0 },
  { p: 0.27, s: 0.92, rx: 6,  ry: 0,   rz: 0,    fx: 0, fy: -10 },
  { p: 0.36, s: 1.00, rx: 4,  ry: -14, rz: 1.2,  fx: 0, fy: 15 },
  { p: 0.46, s: 1.30, rx: 6,  ry: -5,  rz: 0,    fx: 0, fy: -45 },
  { p: 0.54, s: 1.32, rx: 12, ry: 5,   rz: 0,    fx: 0, fy: -35 },
  { p: 0.62, s: 1.25, rx: 14, ry: 9,   rz: -0.8, fx: 0, fy: -30 },
  { p: 0.71, s: 1.38, rx: 6,  ry: -4,  rz: 0,    fx: 0, fy: SEAL_FY * 0.5 },
  { p: 0.76, s: 1.75, rx: 1,  ry: 0,   rz: 0,    fx: 0, fy: SEAL_FY },
  { p: 0.82, s: 2.05, rx: 0,  ry: 0,   rz: 0,    fx: 0, fy: SEAL_FY },
  { p: 0.88, s: 2.20, rx: 0,  ry: 0,   rz: 0,    fx: 0, fy: SEAL_FY },
  { p: 0.92, s: 1.75, rx: -2, ry: -12, rz: 0.8,  fx: 0, fy: SEAL_FY * 0.4 },
  { p: 0.98, s: 1.00, rx: 0,  ry: 0,   rz: 0,    fx: 0, fy: 0 },
  { p: 1.00, s: 1.00, rx: 0,  ry: 0,   rz: 0,    fx: 0, fy: 0 },
];
const camAt = createCamera(CAM_KEYS);
/** rung nhẹ khi sáp chạm nắp (px thiết kế), tắt dần */
const shakeAt = (p: number) => {
  const d = p - (SEND_RANGE.seal[0] + (SEND_RANGE.seal[1] - SEND_RANGE.seal[0]) * SEAL_PRESS_AT);
  return d <= 0 ? 0 : 3.2 * Math.exp(-11 * d) * Math.sin(40 * d);
};

function sendFlapAngle(p: number) {
  const [a, b] = SEND_RANGE.flap;
  const u = clamp01((p - a) / (b - a));
  if (u <= 0) return 180;
  const w = Math.min(1, u / 0.8);
  const closing = 180 * (1 - w * w * (3 - 2 * w));
  const bounce = u > 0.8 ? 5 * Math.sin(Math.PI * ((u - 0.8) / 0.2)) : 0;
  return closing + bounce;
}

type Props = {
  card?: ReactNode;                         // nội dung thiệp (tỉ lệ 5:7)
  envelopeColor: string;                    // hex 6 ký tự
  liner: string;                            // giá trị CSS background
  stampId: string;
  recipientName?: string;
  side: 'front' | 'back';                   // front = mặt địa chỉ, back = mặt nắp
  flapOpen: boolean;
  cardFront?: boolean;
  focus?: 'card' | 'envelope';              // thiệp đã rút ra: vật nào đứng TRƯỚC (vật còn lại lùi chéo ra sau)                      // true: thiệp đã rút ra, đứng trước phong bì
  openAmt?: MotionValue<number>;            // 0..1: bìa thiệp mở bao nhiêu (để thiệp trượt sang phải nhường chỗ cho bìa)
  onEnvClick?: (face: 'front' | 'back') => void;  // chạm vào phong bì
  onCardClick?: () => void;                 // chạm vào thiệp đang nằm trong phong bì -> rút ra
  onRecipientChange?: (v: string) => void;   // có => tên người nhận ở mặt trước sửa được ngay trên phong bì
  onSwap?: (to: 'card' | 'envelope') => void;     // thiệp đã rút ra: chạm vào vật nào thì vật đó muốn lên trước
  /** có => chuyển động bám theo tiến độ này (0..1) thay vì chạy theo thời gian; bỏ qua mọi animation theo props */
  send?: MotionValue<number>;
  /** gọi một lần khi cảnh đã đo xong khung chứa và hiện hình */
  onReady?: () => void;
};

/** sáp đỏ thẫm; nếu phong bì đã đỏ thì dùng sáp vàng đồng cho nổi */
function pickSeal(hex: string) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r > 140 && g < 100 && b < 120 ? '#B8862B' : '#A3152F';
}
function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150;
}
const onKey = (fn?: () => void) => (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn?.(); }
};

/** Một "tấm" phong bì lật quanh trục dọc. Cả hai tấm (lưng + mặt trước) dùng chung perspective và góc lật
 *  nên khớp tuyệt đối với nhau; thiệp chen vào GIỮA hai tấm theo trục z. */
function Rotor({ flip, origin, children, innerRef }: { flip: MotionValue<number>; origin: MotionValue<string>; children: ReactNode; innerRef?: React.Ref<HTMLDivElement> }) {
  return (
    <motion.div className={s.stage3d} data-stage3d style={{ perspectiveOrigin: origin }}>
      <motion.div ref={innerRef} className={s.envelope} data-envelope style={{ left: ENV.x, top: ENV.y, width: ENV.w, height: ENV.h, rotateY: flip }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

export function EnvelopeScene({
  card, envelopeColor, liner, stampId, recipientName = 'Tên người nhận',
  side, flapOpen, cardFront = false, focus = 'card', openAmt, onEnvClick, onCardClick, onSwap, onRecipientChange, send, onReady,
}: Props) {
  // Hiệu ứng là tính năng cốt lõi của thiệp: luôn chạy, kể cả khi hệ điều hành bật "giảm chuyển động"
  // (trước đây reduce=true làm mọi animation có duration 0 nên hai vật nhảy thẳng sang vị trí mới)
  const reduce = false;
  const pmId = useId().replace(/:/g, '');
  const box = useRef<HTMLDivElement>(null);
  const envRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [dim, setDim] = useState<{ k: number; w: number; h: number } | null>(null);

  const flip = useMotionValue(side === 'front' ? 0 : 180);
  const flapRot = useMotionValue(flapOpen ? 180 : 0);
  const t = useMotionValue(cardFront ? 1 : 0);      // 0 = thiệp trong phong bì · 1 = thiệp rút ra phía trước
  const rise = useMotionValue(flapOpen ? 1 : 0);    // 0 = thiệp cất kín · 1 = thiệp thò lên khỏi miệng phong bì
  const fv = useMotionValue(focus === 'envelope' ? 1 : 0);   // 0 = thiệp ở trước · 1 = phong bì ở trước
  const idleOpen = useMotionValue(0);
  const show = useMotionValue(0);                   // 0..1: thiệp tiến sát camera khoe mặt bìa
  const sealP = useMotionValue(0);                  // 0..1: con dấu sáp (chỉ chạy trong chế độ gói thiệp)
  const idleSend = useMotionValue(0);
  const sendP = send ?? idleSend;
  // máy quay (chỉ áp dụng khi có `send`)
  const cam = useTransform(sendP, camAt);
  const shake = useTransform(sendP, shakeAt);
  const camScale = useTransform(cam, (c) => c.s);
  const camRX = useTransform(cam, (c) => c.rx);
  const camRY = useTransform(cam, (c) => c.ry);
  const camRZ = useTransform(cam, (c) => c.rz);
  const camX = useTransform(cam, (c) => -c.fx * c.s);
  const camY = useTransform([cam, shake] as MotionValue<any>[], ([c, sh]: any[]) => -(c as CamKey).fy * (c as CamKey).s + (sh as number) * (c as CamKey).s);
  const open = openAmt ?? idleOpen;

  const rad = Math.PI / 180;
  const sheen = useTransform(flip, (v) => 0.5 * Math.abs(Math.sin(2 * v * rad)));
  const flapShadow = useTransform(flapRot, [0, 45], [1, 0]);
  // Nắp đóng nằm TRÊN thiệp (tấm trước), nắp mở nằm SAU thiệp (tấm lưng). Đổi tấm ở đúng 90° - lúc nắp dựng
  // thẳng đứng, chỉ còn là một đường mảnh - nên không thấy giật.
  const flapBackVis = useTransform(flapRot, (v) => (v > 90 ? 'visible' : 'hidden'));
  const flapFrontVis = useTransform(flapRot, (v) => (v > 90 ? 'hidden' : 'visible'));

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width: w, height: h } = e.contentRect;
      if (w < 1 || h < 1) return;
      // fit theo CẢ chiều rộng lẫn chiều cao khung chứa -> không bao giờ tràn / bị cắt cạnh dưới
      setDim({ k: Math.min(1.3, w / DW, h / DH), w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // (debug) ghi lại mỗi lần props điều khiển thay đổi
  useEffect(() => {
    dbg('props', { side, flapOpen, cardFront, focus, flapRot: flapRot.get(), flip: flip.get() });
  }, [side, flapOpen, cardFront, focus, flapRot, flip]);

  // Lật phong bì
  useEffect(() => {
    if (send) return;
    const c = animate(flip, side === 'front' ? 0 : 180, { duration: reduce ? 0 : 1.15, ease: [0.45, 0, 0.2, 1] });
    return () => c.stop();
  }, [side, reduce, flip, send]);

  // Nắp phong bì: MỞ = bật lên hơi quá rồi lắng xuống (giấy có độ đàn hồi); ĐÓNG = rơi theo trọng lực (nhanh dần),
  // chạm thân phong bì thì nảy nhẹ 1-2 lần rồi nằm phẳng
  useEffect(() => {
    if (send) return;
    const from = flapRot.get(), to = flapOpen ? 180 : 0;
    if (Math.abs(from - to) < 1) { dbg('flap:skip (đã ở đúng góc, KHÔNG chạy animation)', { from, to, flapOpen }); flapRot.set(to); return; }
    const k = Math.max(0.35, Math.abs(from - to) / 180);
    dbg('flap:animate:start', { from, to, flapOpen, k, reduce });
    const done = (name: string) => () => dbg('flap:animate:' + name, { rot: flapRot.get(), curl: curl.get() });
    const c = flapOpen
      ? animate(flapRot, [from, 188, 180], { duration: reduce ? 0 : 1.2 * k, times: [0, 0.72, 1], ease: [[0.3, 0, 0.2, 1], 'easeInOut'], onComplete: done('done') })
      : animate(flapRot, [from, 0, 7, 0, 1.5, 0], { duration: reduce ? 0 : 1.15 * k + 0.35, times: [0, 0.6, 0.74, 0.86, 0.94, 1], ease: [[0.6, 0, 0.9, 0.5], 'easeOut', 'easeIn', 'easeOut', 'easeIn'], onComplete: done('done') });
    return () => { dbg('flap:animate:cleanup (bị dừng/huỷ)', { rot: flapRot.get() }); c.stop(); };
  }, [flapOpen, reduce, flapRot, send]);

  // Thiệp trồi lên khỏi miệng phong bì SAU khi nắp đã mở; khi đóng nắp thì thiệp chìm xuống TRƯỚC
  useEffect(() => {
    if (send) return;
    const c = animate(rise, flapOpen ? 1 : 0, {
      duration: reduce ? 0 : flapOpen ? 0.95 : 0.75,
      delay: reduce ? 0 : flapOpen ? 0.6 : 0,
      ease: [0.4, 0, 0.2, 1],
    });
    return () => c.stop();
  }, [flapOpen, reduce, rise, send]);

  // Rút thiệp ra / đút thiệp vào: cùng một hành trình, chạy xuôi hoặc ngược
  useEffect(() => {
    if (send) return;
    // t chạy tuyến tính; độ mềm do từng chặng (smoothstep) bên dưới đảm nhiệm
    // thời lượng tỉ lệ với quãng còn lại: bị ngắt giữa chừng thì quay đầu ngay, không phải chạy lại cả 2.6s
    const to = cardFront ? 1 : 0;
    const c = animate(t, to, { duration: reduce ? 0 : Math.max(0.3, 2.6 * Math.abs(to - t.get())), ease: 'linear' });
    return () => c.stop();
  }, [cardFront, reduce, t, send]);

  // Đảo vị trí thiệp <-> phong bì (hai vật đổi chỗ, bay vòng cung quanh nhau)
  useEffect(() => {
    if (send) return;
    const to = focus === 'envelope' ? 1 : 0;
    const c = animate(fv, to, { duration: reduce ? 0 : Math.max(0.4, 1.6 * Math.abs(to - fv.get())), ease: [0.45, 0, 0.2, 1] });
    return () => c.stop();
  }, [focus, reduce, fv, send]);

  // Chế độ gói thiệp: mọi giá trị chuyển động suy ra trực tiếp từ tiến độ `send` (không có animation riêng)
  useEffect(() => {
    if (!send) return;
    const apply = (p: number) => {
      const [c0, c1] = SEND_RANGE.card, [s0, s1] = SEND_RANGE.sink, [f0, f1] = SEND_RANGE.flip, [w0, w1] = SEND_RANGE.seal, [h0, h1] = SEND_RANGE.show;
      t.set(1 - clamp01((p - c0) / (c1 - c0)));
      rise.set(1 - ss(s0, s1, p));
      flapRot.set(sendFlapAngle(p));
      flip.set(180 * (1 - ss(f0, f1, p)));
      fv.set(0);
      sealP.set(clamp01((p - w0) / (w1 - w0)));
      show.set(clamp01((p - h0) / (h1 - h0)));
    };
    apply(send.get());
    return send.on('change', apply);
  }, [send, t, rise, flapRot, flip, fv, sealP, show]);

  // báo cho cha biết cảnh đã hiện hình (để cha ẩn bản đang đứng dưới mà không bị chớp)
  const readyCb = useRef(onReady);
  useEffect(() => { readyCb.current = onReady; }, [onReady]);
  const isReady = !!dim;
  useEffect(() => { if (isReady) readyCb.current?.(); }, [isReady]);

  /* ---------- THIỆP ----------
     RÚT RA  (t 0 → 1):
       1) thiệp NẰM NGANG trượt thẳng LÊN khỏi miệng phong bì
       2) sau đó mới xoay DỌC, đồng thời bay vòng cung (phình sang trái, nhô về phía người xem) hạ về giữa cảnh
     ĐÚT VÀO (t 1 → 0): đúng hành trình ngược lại - xoay ngang trước, rồi mới trượt xuống vào phong bì. */
  const slide = useTransform(t, (v) => ss(0, T_SLIDE, v));       // 0 → 1: trượt lên khỏi miệng
  const swing = useTransform(t, (v) => ss(T_TURN, 1, v));         // 0 → 1: xoay dọc + bay vòng cung
  /* "KHOE THIỆP": thiệp là nhân vật chính. Nó tiến sát camera, lia từ TRÁI sang PHẢI rồi ngược lại (1,5 nhịp) và
     nghiêng theo quán tính để lộ mặt bìa; đồng thời phong bì lùi phía sau trôi NGƯỢC chiều (xem envX). Ở hai đầu
     mọi thứ về 0 nên nối liền với tư thế đứng yên trước / sau. */
  const showB = useTransform(show, (u) => ss(0, 0.2, u) * (1 - ss(0.8, 1, u)));
  const sway = useTransform(show, (u) => Math.sin(2 * Math.PI * ss(0, 1, u)));           // 1 nhịp con lắc êm (chậm ở hai đầu): giữa → phải → trái → giữa
  const swayLag = useTransform(show, (u) => Math.sin(2 * Math.PI * ss(0, 1, u) - 0.4));   // góc xoay trễ pha nhẹ so với vị trí
  const showRY = useTransform([swayLag, showB], ([l, b]: number[]) => b * 28 * l);
  const showRX = useTransform([show, showB], ([u, b]: number[]) => b * (-5 + 6 * Math.cos(2 * Math.PI * ss(0, 1, u))));
  const showRZ = useTransform([sway, showB], ([w, b]: number[]) => b * 3.4 * w);   // nghiêng ngang theo chiều lia
  const glareX = useTransform(show, (u) => -CARD_W * 0.7 + CARD_W * 2 * ss(0.15, 0.85, u));
  const glareOp = useTransform(show, (u) => 0.8 * Math.sin(Math.PI * ss(0.1, 0.9, u)));
  const cardX = useTransform([swing, open, fv, showB, sway], ([u, op, f, b, w]: number[]) => {
    const closed = lerp(POSE.outClosed.cx, POSE.behind.cx, f);
    const outX = lerp(closed, POSE.outOpen.cx, op * (1 - f));
    return lerp(POSE.sealed.cx, outX, u) + BOW * Math.sin(Math.PI * u) * (1 - f) - ORB_X * Math.sin(Math.PI * f) * u - CARD_CX + (CX - POSE.outClosed.cx) * 0.8 * b + 92 * b * w;
  });
  const cardY = useTransform([slide, swing, rise, open, fv, showB, sway], ([sl, u, r, op, f, b, w]: number[]) => {
    const inY = lerp(POSE.sealed.cy, POSE.peek.cy, r);
    const y0 = lerp(inY, POSE.slid.cy, sl);
    const closed = lerp(POSE.outClosed.cy, POSE.behind.cy, f);
    const outY = lerp(closed, POSE.outOpen.cy, op * (1 - f));
    return lerp(y0, outY, u) - CARD_CY - SWAP_ARC * Math.sin(Math.PI * f) * u - 18 * b - 12 * b * w * w;   // cung võng: nhấc lên ở hai biên, không gãy khúc   // nhấc lên khi đổi chỗ
  });
  const cardScale = useTransform([swing, open, fv, showB], ([u, op, f, b]: number[]) => {
    const closed = lerp(POSE.outClosed.s, POSE.behind.s, f);
    return lerp(POSE.sealed.s, lerp(closed, POSE.outOpen.s, op * (1 - f)), u) * (1 - ORB_DIP * Math.sin(Math.PI * f) * u) * (1 + 0.3 * b);
  });
  const cardRotZ = useTransform([swing, showRZ], ([u, z]: number[]) => -90 * (1 - u) + z);      // -90° = nằm ngang · 0° = đứng thẳng
  const cardRotX = useTransform([swing, showRX], ([u, x]: number[]) => -16 * Math.sin(Math.PI * u) + x);
  // Phong bì lật mặt trước: thiệp (đang nằm trong túi) xoay CÙNG phong bì, nếu không lúc phong bì mỏng như tờ giấy (≈90°) cả tấm thiệp lộ ra phía sau
  const flipTurn = useTransform(flip, (v) => (send ? v - 180 : 0));
  const cardRotY = useTransform([swing, fv, showRY, flipTurn], ([u, f, y, ft]: number[]) => 38 * Math.sin(Math.PI * u) + ORB_YAW * Math.sin(Math.PI * f) * u + y + ft);
  // z = 1 nằm GIỮA lưng phong bì (z 0) và mặt trước (z 2); ra ngoài thì lên trước (z 100) hoặc lùi hẳn ra sau phong bì (z -160)
  const cardZ = useTransform([t, fv], ([v, f]: number[]) => {
    const u = ss(T_SLIDE, 1, v);
    return 1 + 99 * u + Z_BUMP * Math.sin(Math.PI * u) * (1 - f) - 260 * ss(0.35, 0.65, f) * u;
  });
  // z-index: lưng phong bì = 1 · thiệp (đang trong) = 2 · mặt trước phong bì = 3
  // bóng thiệp nhiều lớp: sát giấy (tiếp xúc) + mềm + xa; thiệp càng "nhấc" gần camera bóng càng xa và nhoè, lệch ngược chiều nghiêng
  const cardShadow = useTransform([showB, showRY, swing], ([b, ry, u]: number[]) => {
    const ox = -ry * 0.9, oy = 5 + 46 * b + 10 * Math.sin(Math.PI * u);
    return `${ox * 0.2}px ${oy * 0.2}px 2px rgb(0 0 0 / .28), ${ox * 0.6}px ${oy * 0.6}px ${10 + 22 * b}px -1px rgb(0 0 0 / .32), ${ox}px ${oy}px ${26 + 44 * b}px -6px rgb(0 0 0 / .42), ${ox * 1.8}px ${oy * 1.9}px ${60 + 70 * b}px -14px rgb(0 0 0 / .5)`;
  });
  const cardLayer = useTransform([t, fv], ([v, f]: number[]) => (ss(T_SLIDE, 1, v) < 0.001 ? 2 : f < 0.5 ? 4 : 0));
  // Chế độ gói thiệp: thiệp KHÔNG mờ đi - nó nằm gọn trong phong bì (bị mảnh trước + nắp che) tới lúc đóng nắp xong
  const cardOpacity = useTransform([t, rise], ([tt, r]: number[]) => (send ? 1 : Math.min(1, r * 3 + tt * 6)));

  // máy quay: chỉ cần kéo xuống khi nắp đang mở (nhìn từ mặt nắp) và thiệp còn nằm trong phong bì
  const backAmt = useTransform(flip, (v) => (1 - Math.cos(v * rad)) / 2);   // 0 = mặt địa chỉ · 1 = mặt nắp
  // tâm phối cảnh trượt xuống khi quay ra mặt nắp (mặt địa chỉ giữ nguyên chính diện)
  // chỉ hạ khi nắp đã hé (>~20°): nắp đóng giữ tâm phối cảnh ở giữa, nên không lệch khe nào so với thân
  const persp = useTransform([backAmt, flapRot], ([ba, fr]: number[]) =>
    `${ENV.x + ENV.w / 2}px ${ENV.y + ENV.h / 2 + PERSP_DROP * ba * clamp01(fr / 20)}px`);

  /* ĐỘ UỐN CỦA NẮP (độ, âm = mũi tụt lại sau bản lề):
       - trọng lực: giấy oằn nhiều nhất khi nắp dựng ngang (~90°), phẳng khi đóng / mở hẳn
       - vận tốc: mở nhanh thì mũi tụt lại, đóng sập thì mũi văng theo (và rung khi nảy)
     Mũi nắp không bao giờ được chui xuống dưới mặt phong bì (góc tuyệt đối >= 1°). */
  const flapVel = useSpring(useVelocity(flapRot), { stiffness: 160, damping: 26 });
  const curl = useTransform([flapRot, flapVel], ([r, v]: number[]) => {
    const sag = -24 * Math.sin(clamp01(r / 180) * Math.PI);
    const drag = Math.max(-20, Math.min(20, -v * 0.045)) * clamp01(r / 40);
    // sát thân thì mũi không được bật lên (nắp đóng phải khít), và cũng không được chui xuống dưới thân
    return Math.max(Math.min(sag + drag, Math.max(0, r) * 0.5), -Math.max(0, r - 1));
  });
  const pan = useTransform([flapRot, slide, swing, backAmt], ([fr, sl, sw, ba]: number[]) => {
    const f = clamp01(fr / 180) * ba;
    return (PAN_FLAP * f + (PAN_SLID - PAN_FLAP) * sl * f) * (1 - sw);
  });

  /* ---------- PHONG BÌ: tụt xuống + lùi ra sau để nhường chỗ cho thiệp, nhưng vẫn thấy được (chạm để cất thiệp) ---------- */
  const uOut = useTransform(t, (v) => ss(T_SLIDE, 1, v));
  const flapAmt = useTransform([flapRot, backAmt], ([fr, ba]: number[]) => clamp01(fr / 180) * ba);
  const envX = useTransform([uOut, fv, showB, sway], ([u, f, b, w]: number[]) => u * (lerp(ENV_LAYOUT.x[0], ENV_LAYOUT.x[1], f) + ORB_X * Math.sin(Math.PI * f)) - 118 * b * w);   // ngược chiều thiệp
  const envY = useTransform([uOut, fv, flapAmt], ([u, f, fa]: number[]) =>
    u * (lerp(ENV_LAYOUT.y[0], ENV_LAYOUT.y[1], f) * fa + SWAP_ARC * Math.sin(Math.PI * f)));
  const envS = useTransform([uOut, fv, showB], ([u, f, b]: number[]) => (1 + u * (lerp(ENV_LAYOUT.s[0], ENV_LAYOUT.s[1], f) - 1)) * (1 - ORB_DIP * Math.sin(Math.PI * f) * u) * (1 - 0.06 * b));
  const backZ = useTransform([t, fv], ([v, f]: number[]) => -ENV_PUSH * ss(T_SLIDE, 0.9, v) * (1 - ss(0.35, 0.65, f)));
  const frontZ = useTransform(backZ, (v) => v + 2);
  // hai vật nghiêng ngược chiều nhau trong lúc bay -> cảm giác xoay quanh nhau trong không gian
  const arc = useTransform(t, (v) => Math.sin(Math.PI * ss(T_TURN - 0.05, 1, v)) * 0.6);   // chỉ nghiêng thoáng qua khi rút/cất thiệp
  const envRotY = useTransform([arc, fv, uOut, swayLag, showB], ([a, f, u, l, b]: number[]) => -22 * a - ORB_YAW * Math.sin(Math.PI * f) * u - 20 * b * l);
  const envRotX = useTransform(arc, (a) => 8 * a);

  const vars = { '--env': envelopeColor, '--ink': isLight(envelopeColor) ? '#17171a' : '#ffffff' } as CSSProperties;
  // Thiệp đã rút ra: việc ĐỔI CHỖ do `tap` bên dưới lo (không dựa vào click của từng mảnh phong bì), nên ở đây bỏ qua
  const envClick = (face: 'front' | 'back') => (e?: { stopPropagation: () => void }) => {
    e?.stopPropagation();
    dbg('scene:envClick', { face, cardFront, focus, blocked: cardFront && focus === 'card' });
    if (cardFront && focus === 'card') return;
    onEnvClick?.(face);
  };

  /* ---------- CHẠM ĐỂ ĐỔI CHỖ ----------
     Trước đây dùng `click` + hit-test DOM của các mảnh 3D (clip-path, backface-hidden, pointer-events:none...) nên có
     những điểm "chạm trượt" - phải bấm vài lần. Giờ: ghi nhận lúc nhấn, tới lúc nhả (và tay không xê dịch) thì tự tính
     xem chạm trúng VẬT NÀO bằng hình học thật trên màn hình: phong bì = thân + nắp tam giác đang dựng,
     thiệp = khung thiệp (+ trang trái khi bìa đang mở). Vật đứng trước được xét trước. */
  const TAP_SLOP = 10;
  const nameRef = useRef<HTMLParagraphElement>(null);
  const tapRef = useRef<{ id: number; x: number; y: number; inCard: boolean } | null>(null);
  const inRect = (r: DOMRect, x: number, y: number) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  const hitEnvelope = (x: number, y: number) => {
    const r = envRef.current?.getBoundingClientRect();
    if (!r) return false;
    if (inRect(r, x, y)) return true;
    // nắp đang dựng lên phía trên thân phong bì (chỉ khi nhìn mặt nắp): vùng tam giác, đỉnh ở trên cùng
    const ext = (r.height / ENV.h) * Math.max(0, flapRise(flapRot.get())) * backAmt.get();
    if (ext > 4 && y >= r.top - ext && y < r.top) {
      const half = (r.width / 2) * ((y - (r.top - ext)) / ext);
      return Math.abs(x - (r.left + r.width / 2)) <= half + 8;
    }
    return false;
  };
  const hitCard = (x: number, y: number, downInside: boolean) => {
    if (downInside) return true;
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return false;
    const extra = open.get() > 0.01 ? r.width : 0;      // bìa đang mở: trang trái nằm ngoài khung thiệp
    return inRect(new DOMRect(r.left - extra, r.top, r.width + extra, r.height), x, y);
  };
  const onTapDown = (e: React.PointerEvent) => {
    tapRef.current = null;
    if (!e.isPrimary) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    tapRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, inCard: !!cardRef.current?.contains(e.target as Node) };
  };
  const onTapUp = (e: React.PointerEvent) => {
    const d = tapRef.current;
    tapRef.current = null;
    if (!d || d.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > TAP_SLOP) return;   // kéo / vẽ / bôi chữ, không phải chạm
    // Mặt địa chỉ đang quay ra trước: chạm vào tên người nhận = SỬA CHỮ (tính bằng hình học, không phụ thuộc hit-test 3D)
    const nr = nameRef.current?.getBoundingClientRect();
    if (onRecipientChange && side === 'front' && (!cardFront || focus === 'envelope') && nr && inRect(nr, e.clientX, e.clientY)) {
      const n = nameRef.current!;
      if (document.activeElement !== n) {
        n.focus();
        const r = document.createRange();
        r.selectNodeContents(n);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(r);
      }
      return;
    }
    if (!cardFront || !onSwap) return;
    const inCard = hitCard(e.clientX, e.clientY, d.inCard);
    const inEnv = hitEnvelope(e.clientX, e.clientY);
    const tapped = focus === 'card'
      ? (inCard ? 'card' : inEnv ? 'envelope' : null)
      : (inEnv ? 'envelope' : inCard ? 'card' : null);
    if (tapped) onSwap(tapped);
  };

  const cardPeeking = !cardFront && flapOpen;
  const flapLabel = cardFront ? 'Cất thiệp vào phong bì' : flapOpen ? 'Đóng nắp phong bì' : 'Mở nắp phong bì';

  return (
    <div ref={box} className={s.fit} onPointerDownCapture={onTapDown} onPointerUpCapture={onTapUp} onPointerCancelCapture={() => { tapRef.current = null; }}>
      <div
        className={s.scene}
        style={{
          ...vars, width: DW, height: DH,
          left: dim ? (dim.w - DW * dim.k) / 2 : 0,
          top: dim ? (dim.h - DH * dim.k) / 2 : 0,
          transform: `scale(${dim?.k ?? 1})`,
          visibility: dim ? 'visible' : 'hidden',
        }}
      >
        <motion.div
          className={s.camera}
          style={send ? { x: camX, y: camY, scale: camScale, rotateX: camRX, rotateY: camRY, rotateZ: camRZ, transformPerspective: 1500, transformOrigin: `${CX}px ${CY}px` } : undefined}
        >
        <motion.div className={s.world} style={{ y: pan, perspectiveOrigin: `${CX}px ${CY}px` }}>
          {/* ===== TẤM LƯNG: giấy phong bì, lớp lót, nắp ĐÃ MỞ (nằm sau thiệp) ===== */}
          <motion.div className={s.plane} style={{ x: envX, y: envY, scale: envS, z: backZ, zIndex: 1, rotateY: envRotY, rotateX: envRotX }}>
            <Rotor flip={flip} origin={persp} innerRef={envRef}>
              {/* bóng đổ nằm TRONG khối xoay: cùng rotateY + perspective với phong bì nên luôn khít, không bị đuổi trễ */}
              <div className={s.ground} />
              <div className={`${s.face} ${s.back}`}>
                <div className={s.paper} />
                <div className={s.interior} style={{ background: liner }} />
                <EnvelopeFlap
                  height={FLAP_H} liner={liner} rot={flapRot} curl={curl}
                  visibility={flapBackVis} sheet="back" className={s.hit} onClick={() => envClick('back')()}
                />
              </div>
            </Rotor>
          </motion.div>

          {/* ===== THIỆP: chen giữa hai tấm; luôn có thể chạm để rút ra khi đang nằm trong phong bì ===== */}
          <motion.div
            ref={cardRef}
            className={s.cardPlane}
            style={{
              left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h,
              x: cardX, y: cardY, z: cardZ, zIndex: cardLayer, scale: cardScale,
              rotateX: cardRotX, rotateY: cardRotY, rotateZ: cardRotZ, opacity: cardOpacity,
              ...(send ? { boxShadow: cardShadow, borderRadius: 3 } : null),
            }}
          >
            {card ?? <div className={s.placeholder}>Thiệp của bạn</div>}
            {send && (
              <div className={s.glareClip}>
                <div className={s.paper3d} />
                <motion.div className={s.glare} style={{ x: glareX, opacity: glareOp }} />
              </div>
            )}
            {onCardClick && (
              <div
                className={s.cardHit}
                role="button"
                tabIndex={cardPeeking ? 0 : -1}
                aria-label="Lấy thiệp ra khỏi phong bì"
                style={{ pointerEvents: cardPeeking ? 'auto' : 'none' }}
                onClick={onCardClick}
                onKeyDown={onKey(onCardClick)}
              />
            )}
          </motion.div>

          {/* ===== TẤM TRƯỚC: mặt địa chỉ, hai cánh bên + cánh đáy (miệng túi), nắp ĐANG ĐÓNG ===== */}
          <motion.div className={s.plane} style={{ x: envX, y: envY, scale: envS, z: frontZ, zIndex: 3, rotateY: envRotY, rotateX: envRotX }}>
            <Rotor flip={flip} origin={persp}>
              {/* Mặt trước: địa chỉ */}
              <div className={`${s.face} ${s.hit}`} onClick={envClick('front')}>
                <div className={s.paper} />
                <svg className={s.postmark} viewBox="0 0 100 100" aria-hidden>
                  <defs><path id={pmId} d="M50 50m-33 0a33 33 0 1 1 66 0a33 33 0 1 1-66 0" /></defs>
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.2" />
                  <circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <text fontSize="10.5" letterSpacing="2.4" fill="currentColor" fontWeight="700" fontFamily="system-ui, sans-serif">
                    <textPath href={`#${pmId}`}>INVITATION · POST · 2026 ·</textPath>
                  </text>
                </svg>
                <div className={s.stampBox}><Stamp id={stampId} /></div>
                <svg className={s.cancel} viewBox="0 0 160 44" aria-hidden>
                  {[4, 12, 20, 28, 36].map((y) => (
                    <path key={y} d={`M0 ${y}q10-5 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0`} fill="none" stroke="currentColor" strokeWidth="1.4" />
                  ))}
                </svg>
                <p
                  key={recipientName}
                  ref={nameRef}
                  className={s.name}
                  contentEditable={!!onRecipientChange}
                  suppressContentEditableWarning
                  spellCheck={false}
                  onPointerDown={onRecipientChange ? (e) => e.stopPropagation() : undefined}
                  onClick={onRecipientChange ? (e) => e.stopPropagation() : undefined}
                  onKeyDown={onRecipientChange ? (e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } } : undefined}
                  onBlur={onRecipientChange ? (e) => onRecipientChange(e.currentTarget.innerText.replace(/\s+/g, ' ').trim() || 'Tên người nhận') : undefined}
                >{recipientName}</p>
                <motion.div className={s.sheen} style={{ opacity: sheen }} />
              </div>

              {/* Mặt sau: chỉ những phần NẰM TRƯỚC thiệp */}
              <div
                className={`${s.face} ${s.back}`}
                role="button"
                tabIndex={0}
                aria-label={flapLabel}
                onClick={envClick('back')}
                onKeyDown={onKey(envClick('back'))}
              >
                <div className={s.sides}>
                  <div className={`${s.piece} ${s.pl}`} />
                  <div className={`${s.piece} ${s.pr}`} />
                </div>
                <div className={s.bottom}><div className={`${s.piece} ${s.pb}`} /></div>
                <motion.div className={s.flapShadow} style={{ opacity: flapShadow }}><i /></motion.div>
                <EnvelopeFlap
                  height={FLAP_H} liner={liner} rot={flapRot} curl={curl}
                  visibility={flapFrontVis} sheet="front" className={s.hit}
                />
                {send && (
                  <div className={s.sealAnchor} style={{ left: '50%', top: SEAL_TOP, width: SEAL_D, height: SEAL_D, marginLeft: -SEAL_D / 2 }}>
                    <WaxSeal p={sealP} color={pickSeal(envelopeColor)} />
                  </div>
                )}
                <motion.div className={s.sheen} style={{ opacity: sheen }} />
              </div>
            </Rotor>
          </motion.div>
        </motion.div>
        </motion.div>
      </div>
      <FlapDebugPanel
        sceneRef={box}
        flapRot={flapRot} curl={curl} flip={flip} t={t} rise={rise} backAmt={backAmt}
        info={{
          side, flapOpen, cardFront, focus, scale: dim?.k, container: dim ? `${Math.round(dim.w)}x${Math.round(dim.h)}` : null,
          ENV, FLAP_H, FLAP_STRIPS: 10, PERSP, PERSP_DROP, HINGE_TO_ORIGIN,
          note: 'FLAP_H / PERSP = tỉ lệ độ sâu: nắp cao FLAP_H px, camera cách PERSP px',
        }}
      />
    </div>
  );
}