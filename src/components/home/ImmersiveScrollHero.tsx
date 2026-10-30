"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  AnimatePresence,
  cubicBezier,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTime,
  useTransform,
  useVelocity,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import { ArrowDown } from "lucide-react";
import { Be_Vietnam_Pro, Cormorant_Garamond, Great_Vibes } from "next/font/google";

/* ------------------------------------------------------------------ */
/*  FONT - cả ba đều có subset "vietnamese" nên đủ dấu, không rơi font  */
/*  Tự khai báo ngay trong file: không cần --font-card ở layout nữa.     */
/* ------------------------------------------------------------------ */
const serifFont = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-card-serif",
  display: "swap",
});
const scriptFont = Great_Vibes({
  subsets: ["latin", "vietnamese"],
  weight: "400",
  variable: "--font-card-script",
  display: "swap",
});
const sansFont = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-card-sans",
  display: "swap",
});
const FONT_VARS = `${serifFont.variable} ${scriptFont.variable} ${sansFont.variable}`;

const SERIF = "var(--font-card-serif), 'Cormorant Garamond', 'Times New Roman', serif";
const SCRIPT = "var(--font-card-script), 'Great Vibes', 'Brush Script MT', cursive";
const SANS = "var(--font-card-sans), 'Be Vietnam Pro', system-ui, sans-serif";
/* chữ Hán 囍: các font trên không có glyph này, nên chỉ định rõ font hệ thống hỗ trợ CJK */
const HAN = "'Songti SC','Noto Serif CJK SC','Source Han Serif SC','SimSun','Microsoft YaHei',serif";

/* ------------------------------------------------------------------ */
/*  DỮ LIỆU THIỆP - đổi ở đây là đổi cả tấm thiệp                      */
/* ------------------------------------------------------------------ */
const CARD = {
  bride: "Minh Anh",
  groom: "Quốc Bảo",
  label: "Trân trọng kính mời",
  brideFamily: { title: "Nhà gái", father: "Ông Nguyễn Văn Hải", mother: "Bà Trần Thị Lan" },
  groomFamily: { title: "Nhà trai", father: "Ông Lê Quốc Khánh", mother: "Bà Phạm Thị Mai" },
  announce: "Trân trọng báo tin lễ thành hôn",
  announceSub: "của hai con chúng tôi",
  timeLabel: "Hôn lễ được cử hành vào lúc",
  time: "18 giờ 00 phút",
  weekday: "Chủ nhật",
  day: "13",
  month: "12",
  year: "2026",
  lunar: "Nhằm ngày 04 tháng 11 năm Bính Ngọ", // ngày Âm lịch: nhớ kiểm tra lại khi đổi ngày cưới
  venue: "Trung tâm Tiệc cưới Sen Vàng",
  address: "12 Đường Láng, Đống Đa, Hà Nội",
  thanks: "Rất hân hạnh được đón tiếp quý khách",
  rsvp: "Xác nhận tham dự",
  quote: "Hạnh phúc là khi hai trái tim cùng một nhịp.",
  photo: "" as string, // ví dụ "/images/couple.jpg" - để trống thì hiện khung xanh nhạt
};
const DATE_SHORT = `${CARD.day}.${CARD.month}.${CARD.year}`;

/* ------------------------------------------------------------------ */
/*  MÀU - theo giao diện hero & mẫu thiệp của iCards                   */
/* ------------------------------------------------------------------ */
const HERO_BG = "#F8F8FB";
const CRIMSON = "#A3152F";
const GOLD = "#B8893E";
const GOLD_DK = "#8C6420"; // vàng đậm cho chữ nhỏ (đủ tương phản trên nền xanh nhạt)
const INK = "#1D1B2A";
const NAVY = "#14233F";
const MUTED = "#6B7A99";
const MUTED_DK = "#4F5F84"; // chữ phụ nhỏ trên thiệp
const BLUE_LINE = "#2F4C8F";
const ARCH_FILL = "#CCD9EC";
const CARD_BG = "linear-gradient(145deg,#EBF0FA,#E2E9F5)";

/** Dát vàng: dải sáng trượt theo tiến độ cuộn */
const FOIL =
  "linear-gradient(100deg,#8C6420 0%,#D9B878 20%,#F7E7BC 33%,#B8893E 48%,#8C6420 60%,#E3C27C 78%,#B8893E 100%)";

/** Vân giấy: nhiễu SVG, không cần file ảnh */
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .1  0 0 0 0 .1  0 0 0 0 .2  0 0 0 1.4 -.55'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

const HIDE_BACK: CSSProperties = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

/** Đường cong cho TỪNG ĐOẠN chuyển động (mềm đầu, mềm cuối).
 *  Muốn cuộn "thẳng" như bản cũ: đổi thành (t: number) => t */
const EASE = cubicBezier(0.45, 0, 0.25, 1);
const E = { ease: EASE };

const OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* mọi kích thước tính theo --cw (chiều rộng tấm thiệp dọc) */
const fs = (k: number): CSSProperties => ({ fontSize: `calc(var(--cw) * ${k})` });
const lh = (h: number): CSSProperties => ({ height: `calc(var(--cw) * ${h})` });

/* số giả-ngẫu-nhiên cố định (không gây lệch hydration) */
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const pad2 = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Nội suy từng đoạn theo các mốc cuộn (dùng cho máy quay) */
function sample(v: number, stops: number[], vals: number[], ease: (t: number) => number = (t) => t) {
  const last = stops.length - 1;
  if (v <= stops[0]) return vals[0];
  if (v >= stops[last]) return vals[last];
  let i = 0;
  while (v > stops[i + 1]) i++;
  const t = ease((v - stops[i]) / (stops[i + 1] - stops[i]));
  return vals[i] + (vals[i + 1] - vals[i]) * t;
}

/* ------------------------------------------------------------------ */
/*  QUỸ ĐẠO MÁY QUAY  (p = tiến độ cuộn 0 → 1)                          */
/*  Muốn đổi cảnh quay chỉ cần sửa các bảng số dưới đây.                */
/* ------------------------------------------------------------------ */
// side: +1 = thiệp ở PHẢI (chữ bên trái) · -1 = thiệp ở TRÁI (chữ bên phải) · 0 = giữa
const SIDE_STOPS = [0, 0.11, 0.23, 0.41, 0.5, 0.65, 0.7, 0.91, 0.97, 1];
const SIDE_VALS = [0, 0, 1, 1, -1, -1, 1, 1, -1, -1];

// dolly (px): dương = lại gần, âm = lùi xa -> tạo nhịp "lúc gần lúc xa"
const Z_STOPS = [0, 0.11, 0.23, 0.41, 0.455, 0.5, 0.6, 0.65, 0.7, 0.86, 0.93, 1];
const Z_VALS = [0, 140, -110, 40, -300, -40, -60, -200, 0, -60, -240, -200];

// cận cảnh: k = độ phóng · (u, v) = điểm lấy nét, đơn vị = chiều rộng thiệp, gốc ở TÂM thiệp
// Bìa:        nhãn/vòm (v -0.30) → tên cô dâu (0.14) → tên chú rể (0.37) → ngày (0.525)
// Trang trong: cô dâu (-0.19) → chú rể (-0.05) → giờ + ngày (0.17)
// (vị trí các dòng trên thiệp có chiều cao cố định nên các số này luôn khớp)
const F_STOPS = [0, 0.52, 0.545, 0.57, 0.605, 0.63, 0.66, 0.82, 0.85, 0.875, 0.905, 0.94, 1];
const F_K = [1, 1, 2.2, 3.0, 3.0, 2.6, 1, 1, 2.2, 2.2, 2.0, 1.12, 1];
const F_U = [0, 0, 0, -0.17, 0.17, 0, 0, 0, 0, 0, 0, 0, 0];
const F_V = [0, 0, -0.3, 0.14, 0.37, 0.525, 0, 0, -0.19, -0.05, 0.17, 0, 0];

// thiệp xoay nhẹ quanh trục dọc/ngang khi lia máy -> thấy được chiều sâu
// (chỉ bắt đầu nghiêng SAU khi phong bì đã lùi hẳn ra sau, tránh thiệp cắm vào phong bì)
const RY_STOPS = [0, 0.5, 0.545, 0.57, 0.605, 0.64, 0.7, 0.85, 0.875, 0.905, 0.95, 1];
const RY_VALS = [0, 0, -14, 10, -10, 0, 0, -12, 10, -6, 0, 0];
const RX_STOPS = [0, 0.545, 0.57, 0.605, 0.64, 0.85, 0.875, 0.9, 0.95, 1];
const RX_VALS = [0, 0, 6, -5, 0, 6, -5, 0, 0, 0];

const WIDE = 768; // >= md: chữ đứng cột bên cạnh thiệp; nhỏ hơn: chữ nằm dưới thiệp

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => {
    setM(true);
  }, []);
  return m;
}

/* ------------------------------------------------------------------ */
/*  NỘI DUNG CÁC CHƯƠNG                                                */
/* ------------------------------------------------------------------ */
type Chapter = {
  range: [number, number];
  /** vị trí CHỮ. Thiệp luôn đứng phía đối diện (xem SIDE_VALS) */
  side: "center" | "left" | "right";
  eyebrow: string;
  lines: { text: string; accent?: boolean }[];
  cta?: boolean;
};

const CHAPTERS: Chapter[] = [
  {
    range: [0, 0.11],
    side: "center",
    eyebrow: "Kỷ nguyên mới của thiệp mời",
    lines: [{ text: "Tình yêu của bạn." }, { text: "Câu chuyện độc bản.", accent: true }],
  },
  {
    range: [0.13, 0.4],
    side: "left",
    eyebrow: "Một lá thư, một lời mời",
    lines: [{ text: "Thiệp của bạn không chỉ để xem. Nó để mở." }],
  },
  {
    range: [0.43, 0.64],
    side: "right",
    eyebrow: "Nhẹ như giấy, rõ như ảnh",
    lines: [{ text: "Từng chi tiết được chăm chút như một tấm thiệp in thật." }],
  },
  {
    range: [0.66, 0.89],
    side: "left",
    eyebrow: "Chạm là mở",
    lines: [{ text: "Lời mời, lịch trình, bản đồ và hộp mừng cưới trong một đường cuộn." }],
  },
  {
    range: [0.91, 1],
    side: "right",
    eyebrow: "Đến lượt bạn",
    lines: [{ text: "Dựng thiệp của hai bạn trong 10 phút." }],
    cta: true,
  },
];

/* gói các giá trị chuyển động mà thiệp cần */
type CardFx = {
  p: MotionValue<number>;
  coverRot: MotionValue<number>;
  coverOpacity: MotionValue<number>;
  coverShade: MotionValue<number>;
  castShadow: MotionValue<number>;
  sheenX: MotionValue<string>;
  foilPos: MotionValue<string>;
  glare: MotionValue<string>;
  glareOpacity: MotionValue<number>;
  shadow: MotionValue<string>;
};

/* ------------------------------------------------------------------ */
export function ImmersiveScrollHero() {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();
  const [active, setActive] = useState(0);

  // kích thước THẬT (px) của sân khấu và của tấm thiệp (--cw): máy quay tính theo đơn vị thật
  const vwMV = useMotionValue(1200);
  const vhMV = useMotionValue(800);
  const cwMV = useMotionValue(300);
  useEffect(() => {
    const stage = stageRef.current;
    const probe = probeRef.current;
    if (!stage || !probe) return;
    const measure = () => {
      vwMV.set(stage.clientWidth);
      vhMV.set(stage.clientHeight);
      cwMV.set(probe.offsetWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    ro.observe(probe);
    return () => ro.disconnect();
  }, [vwMV, vhMV, cwMV]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Khi section trượt ra khỏi màn hình (sau khi hết phần ghim): 0 → 1.
  // Dùng để mờ dần cảnh thiệp, nhường chỗ cho Hero phía dưới (blend).
  const { scrollYProgress: exit } = useScroll({
    target: containerRef,
    offset: ["end end", "end start"],
  });
  const exitOpacity = useTransform(exit, [0, 0.7], [1, 0]);
  const exitY = useTransform(exit, [0, 1], ["0svh", "14svh"]);

  // Chuyển động do tay người dùng cuộn nên giữ nguyên cả khi bật "giảm chuyển động";
  // chỉ tắt phần tự chạy (hạt sáng, thiệp trôi lơ lửng, nghiêng theo chuột / tốc độ cuộn).
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.7 });

  useMotionValueEvent(p, "change", (v) => {
    let idx = 0;
    CHAPTERS.forEach((c, i) => {
      if (v >= c.range[0] - 0.005) idx = i;
    });
    setActive(idx);
  });

  /* ---------- NGHIÊNG THEO CHUỘT + THEO TỐC ĐỘ CUỘN ---------- */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const tiltY = useTransform(sx, [-1, 1], [-5, 5]);
  const tiltX = useTransform(sy, [-1, 1], [3, -3]);
  const velocity = useSpring(useVelocity(p), { stiffness: 80, damping: 30 });
  const lean = useTransform(velocity, [-1.2, 0, 1.2], [4, 0, -4]);
  const stageRotX = useTransform([tiltX, lean], ([t, l]: number[]) => t + (reduceMotion ? 0 : l));

  /* ---------- MÁY QUAY: lia trái/phải + dolly gần/xa + nghiêng theo hướng lia ---------- */
  const side = useTransform(p, SIDE_STOPS, SIDE_VALS, E);
  const rigX = useTransform([side, vwMV], ([s, w]: number[]) => s * (w >= WIDE ? 0.24 : 0.06) * w);
  const rigY = useTransform([p, vhMV, vwMV], ([v, h, w]: number[]) =>
    w >= WIDE ? 0 : -0.12 * h * sample(v, [0.11, 0.23], [0, 1])
  );
  const rigZ = useTransform(p, Z_STOPS, Z_VALS, E);
  // lia càng nhanh càng "bank" vào cua, như máy quay trên tay cầm gimbal
  const sideVel = useSpring(useVelocity(side), { stiffness: 90, damping: 28 });
  const yaw = useTransform(
    [side, sideVel],
    ([s, vel]: number[]) => -s * 9 - (reduceMotion ? 0 : clamp(vel * 0.75, -20, 20))
  );

  /* ---------- CẬN CẢNH: phóng to quanh một điểm trên thiệp rồi lia dọc theo nét chữ ---------- */
  const kAt = (v: number, w: number) => {
    const k = sample(v, F_STOPS, F_K);
    return w >= WIDE ? k : 1 + (k - 1) * 0.55; // màn hình nhỏ: phóng ít hơn để không tràn
  };
  const focusK = useTransform([p, vwMV], ([v, w]: number[]) => kAt(v, w));
  const focusX = useTransform([p, vwMV, cwMV], ([v, w, c]: number[]) => -kAt(v, w) * sample(v, F_STOPS, F_U) * c);
  const focusY = useTransform([p, vwMV, cwMV], ([v, w, c]: number[]) => -kAt(v, w) * sample(v, F_STOPS, F_V) * c);

  // thiệp trôi lơ lửng nhẹ như trong không gian (chỉ sau khi đã rút khỏi phong bì)
  const time = useTime();
  const floatAmp = useTransform(p, [0.52, 0.58], [0, 1]);
  const floatY = useTransform([time, floatAmp], ([t, a]: number[]) => (reduceMotion ? 0 : Math.sin(t / 1200) * 5 * a));
  const floatRot = useTransform([time, floatAmp], ([t, a]: number[]) => (reduceMotion ? 0 : Math.sin(t / 1700) * 0.8 * a));

  /* ---------- PHONG BÌ ----------
     Khi thiệp đã rút ra (p ≥ 0.42) cả phong bì vừa rơi xuống vừa LÙI RA SAU theo trục z.
     Nhờ đó thiệp luôn nằm phía trước phong bì, dù đang xoay/nghiêng -> không còn bị cắt vào phong bì. */
  const envScale = useTransform(p, [0, 0.1], [0.9, 1], E);
  const envY = useTransform(p, [0, 0.42, 0.53], ["-50%", "-50%", "260%"], E);
  const envOpacity = useTransform(p, [0.43, 0.52], [1, 0]);
  const envPush = useTransform(p, [0.42, 0.52], [0, -320], E);
  const envZFront = useTransform(envPush, (v) => v + 3);
  const flapRot = useTransform(p, [0.08, 0.2], [0, 180], E);
  const flapZ = useTransform([p, envPush], ([pp, e]: number[]) => (pp < 0.17 ? 5 : 1) + e);

  /* ---------- TẤM THIỆP ----------
     0.02-0.08  dấu sáp nứt đôi, vụn vàng bắn ra
     0.08-0.20  nắp phong bì mở (lộ lớp lót)
     0.20-0.42  thiệp (đang nằm NGANG) rút thẳng ra khỏi phong bì
     0.42-0.54  phong bì rơi + lùi ra sau, thiệp xoay dọc, bay sang TRÁI
     0.54-0.66  CẬN CẢNH bìa: vòm → tên cô dâu → tên chú rể → ngày
     0.68-0.79  bìa lật mở quanh gáy (dính liền), thiệp sang PHẢI, chữ trang trong hiện lần lượt
     0.79-0.84  bìa mờ đi
     0.85-0.91  CẬN CẢNH trang trong: cô dâu → chú rể → giờ + ngày
     0.91-1.00  lùi xa, lướt sang TRÁI, chữ CTA ở bên phải                    */
  const cardY = useTransform(p, [0, 0.2, 0.42, 0.54, 1], ["-48.5%", "-48.5%", "-133%", "-53%", "-53%"], E);
  const cardScale = useTransform(p, [0, 0.1, 0.42, 0.54, 1], [0.855, 0.95, 0.95, 1.05, 1.05], E);
  const cardRotZ = useTransform(p, [0, 0.42, 0.54, 1], [-90, -90, 0, 0], E);
  const cardRotY = useTransform(p, RY_STOPS, RY_VALS, E);
  const cardRotX = useTransform(p, RX_STOPS, RX_VALS, E);
  // z=2 khi còn nằm trong phong bì (giữa lưng z=0 và mặt trước z=3), nhô lên sau khi đã ra hẳn
  const cardZ = useTransform(p, [0, 0.415, 0.43, 1], [2, 2, 40, 40]);

  // Bìa chỉ XOAY quanh gáy (không còn dịch ngang) nên hai trang luôn dính nhau
  const coverRot = useTransform(p, [0.68, 0.79], [0, -180], E);
  const coverOpacity = useTransform(p, [0.79, 0.84], [1, 0]);
  const coverShade = useTransform(p, [0.68, 0.74, 0.8], [0, 0.55, 0.15]);
  const castShadow = useTransform(p, [0.68, 0.74, 0.8], [0, 1, 0]);
  const sheenX = useTransform(p, [0.45, 0.62], ["-130%", "130%"]);
  const foilPos = useTransform(p, [0.42, 1], ["0% 50%", "100% 50%"]);

  // bóng đổ sống: lệch ngược hướng nghiêng, đậm & xa dần khi thiệp bay lại gần
  const shX = useTransform(sx, [-1, 1], [18, -18]);
  const shY = useTransform(p, [0.42, 0.54], [22, 46]);
  const shBlur = useTransform(p, [0.42, 0.54], [38, 70]);
  const shAlpha = useTransform(p, [0.3, 0.5], [0, 0.5]);
  const shadow = useMotionTemplate`${shX}px ${shY}px ${shBlur}px -28px rgba(30,45,100,${shAlpha}), 0 1px 2px rgba(30,45,100,0.18)`;

  // vệt phản chiếu chạy theo con trỏ
  const gx = useTransform(sx, [-1, 1], [15, 85]);
  const gy = useTransform(sy, [-1, 1], [10, 90]);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.5), rgba(255,255,255,0) 55%)`;
  const glareOpacity = useTransform(p, [0.54, 0.6], [0, 1]);

  const fx: CardFx = {
    p,
    coverRot,
    coverOpacity,
    coverShade,
    castShadow,
    sheenX,
    foilPos,
    glare,
    glareOpacity,
    shadow,
  };

  /* ---------- LỚP NỀN (mỗi lớp trôi một tốc độ = chiều sâu) ---------- */
  const blobAX = useTransform([sx, side], ([m, s]: number[]) => m * 24 - s * 70);
  const blobAY = useTransform(p, [0, 1], ["0vh", "-16vh"]);
  const blobBX = useTransform([sx, side], ([m, s]: number[]) => m * -20 - s * 40);
  const blobBY = useTransform(p, [0, 1], ["0vh", "12vh"]);
  const railScale = useTransform(p, [0, 1], [0, 1]);
  const hintOpacity = useTransform(p, [0, 0.04], [1, 0]);

  const vars = { ["--cw" as string]: "min(62vw, 300px, 30svh)" } as CSSProperties;

  const goTo = (i: number) => {
    const el = containerRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const distance = el.offsetHeight - window.innerHeight;
    const at = CHAPTERS[i].range[0] + (i === 0 ? 0 : 0.06);
    window.scrollTo({ top: top + distance * at, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <section ref={containerRef} className="relative h-[700vh]" style={{ background: HERO_BG }}>
      {/* lớp ghim: khi hết phần ghim thì mờ dần + trôi chậm hơn trang -> hoà vào Hero bên dưới */}
      <motion.div className="sticky top-0 h-[100svh] w-full" style={{ opacity: exitOpacity, y: exitY }}>
        <div
          ref={stageRef}
          className={`relative h-full w-full overflow-hidden ${FONT_VARS}`}
          style={vars}
          onPointerMove={(e) => {
            if (e.pointerType === "touch" || reduceMotion) return;
            const r = e.currentTarget.getBoundingClientRect();
            mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
            my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
          }}
          onPointerLeave={() => {
            mx.set(0);
            my.set(0);
          }}
        >
          {/* đo --cw thật để máy quay tính đúng đơn vị */}
          <div ref={probeRef} aria-hidden className="pointer-events-none absolute left-0 top-0 h-px opacity-0" style={{ width: "var(--cw)" }} />

          {/* ---- NỀN: hai vệt màu rất nhẹ, trôi lệch tốc độ (đã bỏ vầng sáng + tia hào quang) ---- */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-[12vw] -top-[10vh] aspect-square w-[55vw]"
            style={{
              x: blobAX,
              y: blobAY,
              background: "radial-gradient(closest-side, rgba(226,170,185,.32), transparent)",
            }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-[12vh] -left-[14vw] aspect-square w-[50vw]"
            style={{
              x: blobBX,
              y: blobBY,
              background: "radial-gradient(closest-side, rgba(238,208,150,.26), transparent)",
            }}
          />

          {mounted && !reduceMotion && <Particles progress={p} side={side} />}

          {/* ---- SÂN KHẤU 3D ---- */}
          <div className="absolute inset-0" style={{ perspective: 1400 }}>
            <motion.div
              className="absolute inset-0"
              style={{ rotateX: stageRotX, rotateY: tiltY, transformStyle: "preserve-3d" }}
            >
              {/* GIÀN MÁY QUAY: mọi thứ bên trong cùng lướt / lùi / xa / nghiêng theo quỹ đạo */}
              <motion.div
                className="absolute inset-0"
                style={{ x: rigX, y: rigY, z: rigZ, rotateY: yaw, transformStyle: "preserve-3d" }}
              >
                {/* 1. Phong bì - lưng (có bóng đổ ở miệng phong bì để thiệp như nằm BÊN TRONG) */}
                <EnvLayer y={envY} scale={envScale} opacity={envOpacity} z={envPush}>
                  <div
                    className="absolute inset-0 rounded-[4px]"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(110,40,65,.30), transparent 42%), linear-gradient(160deg,#EBD5DA,#E1C6CD)",
                      boxShadow: "0 40px 70px -28px rgba(120,50,75,.45)",
                    }}
                  />
                </EnvLayer>

                {/* 2. Thiệp - nằm giữa lưng và mặt trước phong bì */}
                <motion.div
                  className="absolute left-1/2 top-[54%]"
                  style={{
                    width: "var(--cw)",
                    height: "calc(var(--cw) * 1.33)",
                    x: "-50%",
                    y: cardY,
                    scale: cardScale,
                    rotateX: cardRotX,
                    rotateY: cardRotY,
                    rotateZ: cardRotZ,
                    z: cardZ,
                  }}
                >
                  {/* trôi lơ lửng */}
                  <motion.div className="h-full w-full" style={{ y: floatY, rotateZ: floatRot }}>
                    {/* cận cảnh: phóng to quanh điểm lấy nét */}
                    <motion.div
                      className="h-full w-full"
                      style={{ scale: focusK, x: focusX, y: focusY, ["--k" as string]: focusK } as MotionStyle}
                    >
                      <CardBody fx={fx} />
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* 3. Phong bì - mặt trước */}
                <EnvLayer y={envY} scale={envScale} opacity={envOpacity} z={envZFront}>
                  <Tri clip="polygon(0 0, 50% 62%, 0 100%)" bg="linear-gradient(90deg,#F2E2E6,#F6E9EC)" />
                  <Tri clip="polygon(100% 0, 50% 62%, 100% 100%)" bg="linear-gradient(270deg,#F2E2E6,#F6E9EC)" />
                  <Tri clip="polygon(0 100%, 50% 62%, 100% 100%)" bg="linear-gradient(180deg,#FBF1F3,#F3E3E7)" />
                </EnvLayer>

                {/* 4. Nắp phong bì: mặt ngoài + LỚP LÓT mặt trong + dấu sáp nứt đôi */}
                <EnvLayer y={envY} scale={envScale} opacity={envOpacity} z={flapZ}>
                  <motion.div
                    className="absolute inset-0"
                    style={{ rotateX: flapRot, transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}
                  >
                    <Tri clip={FLAP_CLIP} bg="linear-gradient(180deg,#F8ECEF,#F1DFE4)" face="front" />
                    <Tri clip={FLAP_CLIP} bg={LINER} face="back" />
                    <WaxSeal progress={p} />
                  </motion.div>
                </EnvLayer>
              </motion.div>
            </motion.div>
          </div>

          {/* vân giấy phủ nhẹ toàn cảnh để mọi thứ "cùng một chất liệu" */}
          <Grain opacity={0.18} className="z-10" />

          {/* ---- CÁC CHƯƠNG CHỮ: luôn ở phía ĐỐI DIỆN với thiệp ---- */}
          {CHAPTERS.map((c, i) => (
            <ChapterView
              key={i}
              chapter={c}
              progress={p}
              first={i === 0}
              last={i === CHAPTERS.length - 1}
            />
          ))}

          {/* ---- GỢI Ý CUỘN ---- */}
          <motion.div
            style={{ opacity: hintOpacity, color: "#6B6880" }}
            className="absolute bottom-[5svh] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
          >
            <span className="text-[11px] font-semibold uppercase tracking-widest">Cuộn để mở thiệp</span>
            <ArrowDown className="size-5 animate-bounce" style={{ color: CRIMSON }} />
          </motion.div>

          {/* ---- BỘ ĐẾM CHƯƠNG ---- */}
          <div
            aria-hidden
            className="absolute bottom-[5svh] left-6 z-20 hidden items-end gap-2 md:flex lg:left-10"
            style={{ color: INK, fontFamily: SERIF }}
          >
            <div className="relative h-[1em] w-[1.25em] overflow-hidden text-5xl leading-none">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={active}
                  className="absolute inset-0"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.6, ease: OUT }}
                >
                  {pad2(active + 1)}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="pb-1 text-sm" style={{ color: MUTED }}>
              / {pad2(CHAPTERS.length)}
            </span>
          </div>

          {/* ---- THANH TIẾN TRÌNH: bấm vào chấm để nhảy tới chương ---- */}
          <nav aria-label="Các chương" className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 md:block">
            <div className="relative h-44 w-px" style={{ background: "rgba(29,27,42,.12)" }}>
              <motion.div style={{ scaleY: railScale, background: CRIMSON }} className="h-full w-full origin-top" />
              {CHAPTERS.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={c.eyebrow}
                  aria-current={active === i ? "step" : undefined}
                  className="group absolute -left-[7px] grid size-[15px] -translate-y-1/2 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ top: `${c.range[0] * 100}%`, outlineColor: CRIMSON }}
                >
                  <span
                    className="block rounded-full transition-all duration-300"
                    style={{
                      width: active === i ? 10 : 6,
                      height: active === i ? 10 : 6,
                      background: i <= active ? CRIMSON : "rgba(29,27,42,.25)",
                    }}
                  />
                  <span
                    className="pointer-events-none absolute right-7 whitespace-nowrap text-sm italic opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                    style={{ color: MUTED, fontFamily: SERIF }}
                  >
                    {c.eyebrow}
                  </span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  VÂN GIẤY                                                           */
/* ------------------------------------------------------------------ */
function Grain({ opacity = 0.35, className = "" }: { opacity?: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ backgroundImage: GRAIN, backgroundSize: "calc(140px / var(--k, 1)) calc(140px / var(--k, 1))", opacity }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  PHONG BÌ (ngang, vừa khít tấm thiệp nằm ngang bên trong)           */
/* ------------------------------------------------------------------ */
const FLAP_CLIP = "polygon(0 0, 100% 0, 50% 62%)";
// lớp lót mặt trong nắp: đỏ rượu vang + hoa văn caro vàng mảnh
const LINER =
  "repeating-linear-gradient(45deg, rgba(240,214,160,.18) 0 1px, transparent 1px 9px)," +
  "repeating-linear-gradient(-45deg, rgba(240,214,160,.18) 0 1px, transparent 1px 9px)," +
  "linear-gradient(180deg,#B3243F,#8A1730)";

function EnvLayer({
  children,
  y,
  scale,
  opacity,
  z,
}: {
  children: ReactNode;
  y: MotionValue<string>;
  scale: MotionValue<number>;
  opacity: MotionValue<number>;
  z: number | MotionValue<number>;
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-[54%]"
      style={{
        width: "calc(var(--cw) * 1.45)",
        height: "calc(var(--cw) * 1.1)",
        x: "-50%",
        y,
        scale,
        opacity,
        z,
        perspective: 1200,
      }}
    >
      {children}
    </motion.div>
  );
}

function Tri({ clip, bg, face }: { clip: string; bg: string; face?: "front" | "back" }) {
  // "back" = mặt trong của nắp: tự lật 180° quanh trục dọc nên chỉ thấy khi nắp đã lật lên
  const faceStyle: CSSProperties =
    face === "back" ? { ...HIDE_BACK, transform: "rotateY(180deg)" } : face === "front" ? HIDE_BACK : {};
  return <div className="absolute inset-0" style={{ clipPath: clip, background: bg, ...faceStyle }} />;
}

/* ------------------------------------------------------------------ */
/*  DẤU SÁP: nứt đôi theo đường zigzag, hai nửa rơi ra + vụn vàng       */
/* ------------------------------------------------------------------ */
const SEAL_CRACK: [number, number] = [0.02, 0.08];
// nửa trái chồng nhẹ 1% sang nửa phải để không lộ vệt hở khi còn nguyên
const CLIP_L = "polygon(0 0, 53% 0, 48% 20%, 55% 40%, 47% 60%, 54% 80%, 50% 100%, 0 100%)";
const CLIP_R = "polygon(52% 0, 100% 0, 100% 100%, 49% 100%, 53% 80%, 46% 60%, 54% 40%, 47% 20%)";
const SPARKS = Array.from({ length: 10 }, (_, i) => ({
  a: (i / 10) * Math.PI * 2 + rnd(i) * 0.5,
  d: 34 + rnd(i + 20) * 40,
}));

function SealFace() {
  return (
    <div
      className="grid h-full w-full place-items-center rounded-full"
      style={{
        background: `radial-gradient(circle at 35% 30%, #D8405A, ${CRIMSON} 58%, #5E0A1C)`,
        boxShadow:
          "inset 0 0 0 2px rgba(255,255,255,.08), inset 0 -3px 6px rgba(60,0,15,.45), inset 0 3px 5px rgba(255,160,175,.35)",
        color: "#F1D9A6",
        fontFamily: HAN,
        ...fs(0.1),
      }}
    >
      囍
    </div>
  );
}

function SealHalf({ side, progress }: { side: "l" | "r"; progress: MotionValue<number> }) {
  const dir = side === "l" ? -1 : 1;
  const x = useTransform(progress, SEAL_CRACK, ["0%", `${dir * 60}%`], E);
  const y = useTransform(progress, SEAL_CRACK, ["0%", "90%"], E);
  const rotate = useTransform(progress, SEAL_CRACK, [0, dir * 26], E);
  const opacity = useTransform(progress, [0.05, 0.1], [1, 0]);
  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, y, rotate, opacity, clipPath: side === "l" ? CLIP_L : CLIP_R }}
    >
      <SealFace />
    </motion.div>
  );
}

function Spark({ progress, a, d }: { progress: MotionValue<number>; a: number; d: number }) {
  const x = useTransform(progress, [0.03, 0.11], [0, Math.cos(a) * d], E);
  const y = useTransform(progress, [0.03, 0.11], [0, Math.sin(a) * d + 14], E); // +14: rơi nhẹ như có trọng lực
  const opacity = useTransform(progress, [0.03, 0.045, 0.11], [0, 1, 0]);
  const scale = useTransform(progress, [0.03, 0.11], [1.2, 0.2]);
  return (
    <motion.span
      className="absolute left-1/2 top-1/2 -ml-[2px] -mt-[2px] size-1 rounded-full"
      style={{ x, y, opacity, scale, background: "#F6DDA0", boxShadow: "0 0 6px 1px rgba(240,200,120,.9)" }}
    />
  );
}

function WaxSeal({ progress }: { progress: MotionValue<number> }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        top: "55%",
        width: "calc(var(--cw) * 0.22)",
        height: "calc(var(--cw) * 0.22)",
        filter: "drop-shadow(0 5px 6px rgba(90,10,30,.45))",
        ...HIDE_BACK,
      }}
    >
      <SealHalf side="l" progress={progress} />
      <SealHalf side="r" progress={progress} />
      {SPARKS.map((s, i) => (
        <Spark key={i} progress={progress} a={s.a} d={s.d} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TẤM THIỆP - MỘT trang dọc, nền xanh nhạt, viền vàng kép             */
/*  Mọi dòng chữ có CHIỀU CAO CỐ ĐỊNH (Line) => vị trí không phụ thuộc   */
/*  font, nên các điểm cận cảnh (F_V) luôn trúng đúng dòng.              */
/* ------------------------------------------------------------------ */
function Frame() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        inset: "calc(var(--cw) * 0.028)",
        border: "1px solid rgba(184,137,62,.6)",
        outline: "1px solid rgba(184,137,62,.28)",
        outlineOffset: "calc(var(--cw) * 0.008)",
      }}
    />
  );
}

function Paper({
  children,
  opacity,
  flip,
}: {
  children?: ReactNode;
  opacity?: MotionValue<number>;
  flip?: boolean; // mặt sau của bìa: phải tự lật 180° mới nhìn thấy được
}) {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: CARD_BG,
        color: NAVY,
        boxShadow: "inset 0 0 0 1px rgba(47,76,143,.10), inset 0 1px 0 rgba(255,255,255,.7)",
        opacity,
        rotateY: flip ? 180 : 0,
        ...HIDE_BACK,
      }}
    >
      {children}
      <Frame />
      <Grain opacity={0.35} />
    </motion.div>
  );
}

/** Một dòng chữ có chiều cao cố định, căn giữa, không xuống dòng */
function Line({ h, children, style }: { h: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="flex items-center justify-center whitespace-nowrap text-center" style={{ ...lh(h), ...style }}>
      {children}
    </div>
  );
}

/** Nhãn IN HOA nhỏ, giãn chữ */
const caps = (k: number, color = BLUE_LINE, spacing = "0.16em"): CSSProperties => ({
  ...fs(k),
  fontFamily: SANS,
  fontWeight: 600,
  letterSpacing: spacing,
  textTransform: "uppercase",
  color,
});
/** Chữ serif; số luôn là số đứng (không bị số kiểu cổ của Cormorant) */
const serif = (k: number, weight = 500): CSSProperties => ({
  ...fs(k),
  fontFamily: SERIF,
  fontWeight: weight,
  fontVariantNumeric: "lining-nums",
});

function Arch({ w, h, photo }: { w: number; h: number; photo?: string }) {
  return (
    <div
      className="overflow-hidden"
      style={{
        width: `calc(var(--cw) * ${w})`,
        height: `calc(var(--cw) * ${h})`,
        borderRadius: "999px 999px 0 0",
        background: ARCH_FILL,
        border: `1px solid ${BLUE_LINE}`,
        boxShadow: "inset 0 10px 24px -12px rgba(20,35,63,.25)",
      }}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}

/* chữ dát vàng: dải sáng trượt theo cuộn */
function Foil({
  pos,
  children,
  style,
}: {
  pos: MotionValue<string>;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <motion.span
      className="inline-block"
      style={{
        backgroundImage: FOIL,
        backgroundSize: "260% 100%",
        backgroundPosition: pos,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        padding: "0 0.12em", // chữ nghiêng không bị cắt mép khi clip theo chữ
        ...style,
      }}
    >
      {children}
    </motion.span>
  );
}

/* từng khối trong trang trong hiện lần lượt khi bìa vừa lật ra */
function InsideItem({
  p,
  at,
  children,
}: {
  p: MotionValue<number>;
  at: number;
  children: ReactNode;
}) {
  const opacity = useTransform(p, [at, at + 0.05], [0, 1]);
  const y = useTransform(p, [at, at + 0.05], ["8px", "0px"]);
  return (
    <motion.div className="flex w-full flex-col items-center" style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}

type Family = { title: string; father: string; mother: string };

function FamilyCol({ data }: { data: Family }) {
  const parent: CSSProperties = { ...serif(0.04, 600), color: NAVY };
  return (
    <div className="flex min-w-0 flex-col items-center">
      <Line h={0.05} style={caps(0.026, GOLD_DK, "0.2em")}>
        {data.title}
      </Line>
      <Line h={0.06} style={parent}>
        {data.father}
      </Line>
      <Line h={0.06} style={parent}>
        {data.mother}
      </Line>
    </div>
  );
}

/* TRANG TRONG - bố cục thiệp cưới Việt:
   Nhà gái | 囍 | Nhà trai  →  lời báo tin  →  tên hai con  →  giờ, thứ ngày tháng năm (+ Âm lịch)  →  địa điểm  →  lời cảm ơn + xác nhận */
function InsidePage({ fx }: { fx: CardFx }) {
  const { p } = fx;
  const gold = "rgba(184,137,62,.6)";
  return (
    <Paper>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgba(30,50,100,.10), transparent 14%)" }}
      />
      {/* tổng chiều cao các khối = 1.05 · khung trong = 1.33 - 0.15 = 1.18 · phần dư chia đều giữa các khối */}
      <div
        className="relative flex h-full flex-col items-center justify-between"
        style={{ padding: "calc(var(--cw) * 0.08) calc(var(--cw) * 0.08) calc(var(--cw) * 0.07)" }}
      >
        {/* 1. Nhà gái | 囍 | Nhà trai  (h 0.17) */}
        <InsideItem p={p} at={0.7}>
          <div
            className="grid w-full items-start"
            style={{ gridTemplateColumns: "1fr auto 1fr", columnGap: "calc(var(--cw) * 0.02)" }}
          >
            <FamilyCol data={CARD.brideFamily} />
            <div className="self-center" style={{ paddingTop: "calc(var(--cw) * 0.03)" }}>
              <Foil pos={fx.foilPos} style={{ ...fs(0.08), fontFamily: HAN, lineHeight: 1 }}>
                囍
              </Foil>
            </div>
            <FamilyCol data={CARD.groomFamily} />
          </div>
        </InsideItem>

        {/* 2. Lời báo tin  (h 0.10) */}
        <InsideItem p={p} at={0.725}>
          <Line h={0.05} style={caps(0.025, BLUE_LINE, "0.12em")}>
            {CARD.announce}
          </Line>
          <Line h={0.05} style={{ ...serif(0.045, 500), fontStyle: "italic", color: MUTED_DK }}>
            {CARD.announceSub}
          </Line>
        </InsideItem>

        {/* 3. Tên hai con  (h 0.285) */}
        <InsideItem p={p} at={0.75}>
          <Line h={0.115} style={{ fontFamily: SCRIPT, ...fs(0.105), color: NAVY }}>
            {CARD.bride}
          </Line>
          <Line h={0.055}>
            <Foil pos={fx.foilPos} style={{ ...serif(0.06, 500), fontStyle: "italic", lineHeight: 1 }}>
              &amp;
            </Foil>
          </Line>
          <Line h={0.115} style={{ fontFamily: SCRIPT, ...fs(0.105), color: NAVY }}>
            {CARD.groom}
          </Line>
        </InsideItem>

        {/* 4. Thời gian  (h 0.265) */}
        <InsideItem p={p} at={0.775}>
          <Line h={0.045} style={caps(0.023, MUTED_DK, "0.12em")}>
            {CARD.timeLabel}
          </Line>
          <Line h={0.065} style={{ ...serif(0.058, 600), color: NAVY }}>
            {CARD.time}
          </Line>
          <div
            className="grid w-full items-center"
            style={{
              ...lh(0.11),
              gridTemplateColumns: "1fr auto 1fr",
              borderTop: `1px solid ${gold}`,
              borderBottom: `1px solid ${gold}`,
            }}
          >
            <span className="text-center" style={caps(0.026, BLUE_LINE, "0.14em")}>
              {CARD.weekday}
            </span>
            <span
              className="text-center"
              style={{
                ...serif(0.1, 500),
                lineHeight: 1,
                color: NAVY,
                padding: "0 calc(var(--cw) * 0.05)",
                borderLeft: `1px solid ${gold}`,
                borderRight: `1px solid ${gold}`,
              }}
            >
              {CARD.day}
            </span>
            <span className="flex flex-col items-center">
              <span style={caps(0.026, BLUE_LINE, "0.14em")}>Tháng {CARD.month}</span>
              <span style={{ ...serif(0.05, 600), lineHeight: 1.1, color: NAVY }}>{CARD.year}</span>
            </span>
          </div>
          <Line h={0.045} style={{ ...serif(0.036, 500), fontStyle: "italic", color: MUTED_DK }}>
            ({CARD.lunar})
          </Line>
        </InsideItem>

        {/* 5. Địa điểm  (h 0.12) */}
        <InsideItem p={p} at={0.795}>
          <Line h={0.035} style={caps(0.022, GOLD_DK, "0.24em")}>
            Tại
          </Line>
          <Line h={0.05} style={{ ...serif(0.05, 600), color: NAVY }}>
            {CARD.venue}
          </Line>
          <Line h={0.035} style={{ ...fs(0.027), fontFamily: SANS, fontWeight: 500, color: MUTED_DK }}>
            {CARD.address}
          </Line>
        </InsideItem>

        {/* 6. Lời cảm ơn + xác nhận  (h 0.11) */}
        <InsideItem p={p} at={0.815}>
          <Line h={0.04} style={{ ...serif(0.036, 500), fontStyle: "italic", color: MUTED_DK }}>
            {CARD.thanks}
          </Line>
          <div style={{ height: "calc(var(--cw) * 0.01)" }} />
          <div
            className="flex items-center justify-center rounded-full text-white"
            style={{
              ...lh(0.06),
              ...fs(0.032),
              fontFamily: SANS,
              fontWeight: 600,
              background: NAVY,
              padding: "0 calc(var(--cw) * 0.08)",
            }}
          >
            {CARD.rsvp}
          </div>
        </InsideItem>
      </div>

      {/* bóng do chính cái bìa đang lật đổ xuống trang trong */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: fx.castShadow,
          background: "linear-gradient(90deg, rgba(20,35,80,.38), rgba(20,35,80,0) 60%)",
        }}
      />
    </Paper>
  );
}

function CardBody({ fx }: { fx: CardFx }) {
  const scriptName: CSSProperties = { fontFamily: SCRIPT, ...fs(0.13), color: NAVY };
  return (
    // perspective đặt NGAY trên cha trực tiếp của bìa => bìa lật có phối cảnh thật, mép bìa phình to về phía người xem
    <motion.div className="relative h-full w-full" style={{ boxShadow: fx.shadow, perspective: 1500 }}>
      {/* trang trong (nằm dưới bìa) */}
      <InsidePage fx={fx} />

      {/* BÌA: lật quanh gáy bên trái - chỉ xoay, KHÔNG dịch ngang nên không bao giờ tách khỏi trang trong */}
      <motion.div
        className="absolute inset-0"
        style={{
          rotateY: fx.coverRot,
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
        }}
      >
        {/* mặt trước */}
        <Paper opacity={fx.coverOpacity}>
          {/* chiều cao: 0.06 + 0.46 + 0.37 + 0.06 + 3 khoảng 0.05 = 1.10, căn giữa trang */}
          <div className="flex h-full flex-col items-center justify-center" style={{ gap: "calc(var(--cw) * 0.05)" }}>
            <Line h={0.06} style={caps(0.034, MUTED_DK, "0.2em")}>
              {CARD.label}
            </Line>
            <Arch w={0.42} h={0.46} photo={CARD.photo || undefined} />
            <div className="flex flex-col items-center">
              <Line h={0.15} style={scriptName}>
                {CARD.bride}
              </Line>
              <Line h={0.07}>
                <Foil pos={fx.foilPos} style={{ ...serif(0.075, 500), fontStyle: "italic", lineHeight: 1 }}>
                  &amp;
                </Foil>
              </Line>
              <Line h={0.15} style={scriptName}>
                {CARD.groom}
              </Line>
            </div>
            <Line h={0.06} style={{ ...caps(0.036, NAVY, "0.1em"), fontVariantNumeric: "lining-nums" }}>
              {CARD.weekday} · {DATE_SHORT}
            </Line>
          </div>
          {/* bìa tối dần về phía gáy khi lật */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: fx.coverShade,
              background: "linear-gradient(90deg, rgba(20,35,80,.6), rgba(20,35,80,0) 75%)",
            }}
          />
          <motion.div
            aria-hidden
            style={{ x: fx.sheenX }}
            className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          />
        </Paper>

        {/* mặt sau của bìa (mặt trong bìa) - chỉ có câu chúc, nhìn thấy khi bìa lật */}
        <Paper flip opacity={fx.coverOpacity}>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "linear-gradient(270deg, rgba(30,50,100,.10), transparent 14%)" }}
          />
          <div className="flex h-full flex-col items-center justify-center px-[calc(var(--cw)*0.14)] text-center" style={{ gap: "calc(var(--cw) * 0.05)" }}>
            <span style={{ ...fs(0.08), fontFamily: HAN, color: GOLD, lineHeight: 1 }}>囍</span>
            <p
              style={{
                ...serif(0.07, 500),
                fontStyle: "italic",
                color: MUTED_DK,
                lineHeight: 1.4,
              }}
            >
              {CARD.quote}
            </p>
          </div>
        </Paper>
      </motion.div>

      {/* ánh sáng phản chiếu chạy theo con trỏ */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: fx.glare, opacity: fx.glareOpacity }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  HẠT SÁNG + CÁNH HOA: mỗi hạt có "độ sâu" riêng, trôi theo cuộn      */
/* ------------------------------------------------------------------ */
const PARTICLE_COLORS = ["#E2A9B8", "#D9B878", "#F3D9A0", "#EBC4CF"];

function Particles({ progress, side }: { progress: MotionValue<number>; side: MotionValue<number> }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 14 }).map((_, i) => (
        <Particle key={i} i={i} progress={progress} side={side} />
      ))}
    </div>
  );
}

function Particle({
  i,
  progress,
  side,
}: {
  i: number;
  progress: MotionValue<number>;
  side: MotionValue<number>;
}) {
  const depth = 0.3 + rnd(i + 3) * 0.9;
  const size = Math.round((3 + rnd(i + 5) * 5) * 10) / 10;
  const left = (rnd(i + 1) * 100).toFixed(1);
  const top = (rnd(i + 2) * 100).toFixed(1);
  const petal = i % 3 === 0;

  const y = useTransform(progress, [0, 1], [0, -depth * 260]);
  // thiệp lướt sang phải thì hạt trôi ngược lại, hạt càng gần càng trôi nhiều = thị sai 3D
  const drift = (rnd(i + 9) - 0.5) * depth * 120;
  const x = useTransform([progress, side], ([pp, sd]: number[]) => drift * pp - sd * depth * 80);
  const rotate = useTransform(progress, [0, 1], [0, (rnd(i + 11) - 0.5) * 360]);

  return (
    <motion.span className="absolute" style={{ left: `${left}%`, top: `${top}%`, x, y, rotate }}>
      <motion.span
        className="block"
        style={{
          width: size,
          height: petal ? size * 1.6 : size,
          borderRadius: petal ? "100% 0 100% 0" : "999px",
          background: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        }}
        animate={{ y: [0, -18 - rnd(i + 4) * 30, 0], opacity: [0, 0.6, 0] }}
        transition={{
          duration: 6 + (i % 5) * 1.2,
          repeat: Infinity,
          delay: rnd(i + 6) * 5,
          ease: "easeInOut",
        }}
      />
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  CHỮ THEO CHƯƠNG: từng từ trồi lên khỏi "khe cắt" theo tiến độ cuộn  */
/* ------------------------------------------------------------------ */
const MASK_PAD: CSSProperties = {
  // chừa chỗ cho dấu tiếng Việt chồng cao (Ẫ, Ộ...) để overflow-hidden không cắt mất
  padding: "0.22em 0.06em 0.16em",
  margin: "-0.22em -0.06em -0.16em",
};

type RevealProps = {
  progress: MotionValue<number>;
  range: [number, number];
  order: number;
  count: number;
  first: boolean;
  last: boolean;
  mount?: boolean; // chương đầu: vào bằng thời gian (không cần cuộn)
  mask?: boolean;
  dist?: string;
  children: ReactNode;
};

function Reveal({ progress, range, order, count, first, last, mount, mask, dist = "115%", children }: RevealProps) {
  const [s, e] = range;
  const wIn = Math.min(0.06, (e - s) * 0.4);
  const wOut = Math.min(0.03, (e - s) * 0.2);
  const t = order / count;
  const inS = s + t * wIn * 0.6;
  const inE = inS + wIn * 0.4;
  const outS = e - wOut + t * wOut * 0.5;
  const outE = outS + wOut * 0.5;

  const stops: number[] = [];
  const ys: string[] = [];
  const ops: number[] = [];
  const blurs: string[] = [];
  if (!first) {
    stops.push(inS, inE);
    ys.push(dist, "0%");
    ops.push(0, 1);
    blurs.push("blur(8px)", "blur(0px)");
  }
  if (!last) {
    stops.push(outS, outE);
    ys.push("0%", `-${dist}`);
    ops.push(1, 0);
    blurs.push("blur(0px)", "blur(8px)");
  }
  if (stops.length === 0) {
    stops.push(0, 1);
    ys.push("0%", "0%");
    ops.push(1, 1);
    blurs.push("blur(0px)", "blur(0px)");
  }

  const y = useTransform(progress, stops, ys);
  const opacity = useTransform(progress, stops, ops);
  const filter = useTransform(progress, stops, blurs);

  if (mask) {
    return (
      <span className="inline-block overflow-hidden align-bottom" style={MASK_PAD}>
        <motion.span className="block" style={{ y, opacity, filter }}>
          {mount ? (
            <motion.span
              className="block"
              style={{ transformOrigin: "0% 100%" }}
              initial={{ y: "115%", rotate: 4, opacity: 0 }}
              animate={{ y: "0%", rotate: 0, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.25 + order * 0.07, ease: OUT }}
            >
              {children}
            </motion.span>
          ) : (
            children
          )}
        </motion.span>
      </span>
    );
  }

  return (
    <motion.div style={{ y, opacity, filter }}>
      {mount ? (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.1, ease: OUT }}
        >
          {children}
        </motion.div>
      ) : (
        children
      )}
    </motion.div>
  );
}

const POS: Record<Chapter["side"], string> = {
  // điện thoại: chữ nằm dưới thiệp · từ md: chữ đứng thành cột ở phía ĐỐI DIỆN với thiệp
  center: "inset-x-0 top-[8svh] items-center text-center",
  left:
    "inset-x-0 bottom-[5svh] items-center text-center md:inset-x-auto md:bottom-auto md:left-[6vw] md:top-0 md:h-full md:w-[40vw] md:items-start md:justify-center md:px-0 md:text-left",
  right:
    "inset-x-0 bottom-[5svh] items-center text-center md:inset-x-auto md:bottom-auto md:left-auto md:right-[8vw] md:top-0 md:h-full md:w-[36vw] md:items-start md:justify-center md:px-0 md:text-left",
};

function ChapterView({
  chapter,
  progress,
  first,
  last,
}: {
  chapter: Chapter;
  progress: MotionValue<number>;
  first: boolean;
  last: boolean;
}) {
  const [s, e] = chapter.range;
  const centered = chapter.side === "center";

  // gán thứ tự cho từng "token" (eyebrow = 0, các từ, nút CTA) để so le thời điểm hiện
  let n = 1;
  const lines = chapter.lines.map((l) => ({
    ...l,
    words: l.text.split(" ").map((w) => ({ w, order: n++ })),
  }));
  const total = n + (chapter.cta ? 1 : 0);

  const pointerEvents = useTransform(progress, (v): "auto" | "none" =>
    v >= s + 0.02 && (last || v <= e) ? "auto" : "none"
  );
  // điện thoại: nền mờ dưới chữ để đọc được khi cận cảnh thiệp tràn màn hình
  const scrim = useTransform(progress, [s, s + 0.03, e - 0.02, e], [0, 1, 1, last ? 1 : 0]);

  const common = { progress, range: chapter.range, count: total, first, last, mount: first } as const;

  return (
    <motion.div style={{ pointerEvents }} className={`absolute z-20 flex flex-col px-5 ${POS[chapter.side]}`}>
      {!centered && (
        <motion.div
          aria-hidden
          style={{ opacity: scrim }}
          className="pointer-events-none absolute -top-16 -bottom-[5svh] inset-x-0 -z-10 bg-gradient-to-t from-[#F8F8FB] via-[#F8F8FB]/85 to-transparent md:hidden"
        />
      )}

      <Reveal {...common} order={0} dist="100%">
        <p className="mb-3 text-base italic tracking-wide md:text-lg" style={{ color: CRIMSON, fontFamily: SERIF }}>
          {chapter.eyebrow}
        </p>
      </Reveal>

      <h2
        className={
          centered
            ? "max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl"
            : "max-w-2xl text-xl font-semibold leading-snug tracking-tight sm:text-2xl md:text-4xl md:leading-[1.12] lg:text-5xl"
        }
        style={{ color: INK }}
      >
        {lines.map((line, li) => (
          <span
            key={li}
            className="flex flex-wrap justify-center gap-x-[0.26em] md:justify-start"
            style={line.accent ? { color: CRIMSON } : undefined}
          >
            {line.words.map(({ w, order }) => (
              <Reveal key={order} {...common} order={order} mask>
                {w}
              </Reveal>
            ))}
          </span>
        ))}
      </h2>

      {chapter.cta && (
        <Reveal {...common} order={total - 1} dist="70%">
          <div className="mt-6 flex flex-row items-center gap-3">
            <MagneticLink href="/tao-thiep" primary>
              Tạo thiệp miễn phí
            </MagneticLink>
            <MagneticLink href="#mau-thiep">Xem thiệp mẫu</MagneticLink>
          </div>
        </Reveal>
      )}
    </motion.div>
  );
}

/* nút "hút" nhẹ về phía con trỏ + vệt sáng quét qua khi rê chuột */
function MagneticLink({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  return (
    <motion.a
      href={href}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.25);
        y.set((e.clientY - r.top - r.height / 2) * 0.35);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: 0.96 }}
      style={{
        x: sx,
        y: sy,
        ...(primary
          ? { background: CRIMSON, color: "#fff", outlineColor: CRIMSON, boxShadow: "0 10px 28px -10px rgba(163,21,47,.65)" }
          : { background: "#fff", color: INK, outlineColor: CRIMSON, border: "1px solid rgba(29,27,42,.15)" }),
      }}
      className="group relative overflow-hidden rounded-full px-6 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <span className="relative z-10">{children}</span>
      {primary && (
        <span
          aria-hidden
          className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[320%]"
        />
      )}
    </motion.a>
  );
}