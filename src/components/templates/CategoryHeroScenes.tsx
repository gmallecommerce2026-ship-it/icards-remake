"use client";

// Bốn kiểu 3D cho hero danh mục. Cùng khung cuộn với phong bì (CategoryHero3D): tiến độ p chạy 0 → 1 theo cuộn trang.
// Chữ, màu và ảnh lấy từ cấu hình admin. Chưa có ảnh thì dùng ô màu nhấn để bố cục vẫn đẹp.
// Khung chung (tiêu đề, trượt trái/phải, chữ hai bên) nằm trong CategoryHeroStage.
//
// QUY TẮC CHỐNG LỖI HÌNH: trong một nhóm preserve-3d, các mặt phẳng KHÔNG được cắt nhau (trình duyệt sẽ vẽ ra các mảnh hình nêm).
// Vì vậy các tấm trong cùng một cảnh luôn song song nhau và xếp lớp bằng translateZ khác nhau; chỉ cả nhóm mới nghiêng/xoay (xoay cứng).

import { cubicBezier, motion, useTransform, type MotionValue } from "motion/react";
import type { CSSProperties } from "react";
import type { TemplateHero } from "@/lib/template-heroes";
import { GOLD, SCRIPT, SERIF, Stage, mix } from "./CategoryHeroStage";

export type SceneProps = { p: MotionValue<number>; reduce: boolean; hero: TemplateHero; categoryLabel: string };

const CREAM_PAPER = "linear-gradient(160deg, #fffdf8 0%, #f2e8d5 100%)";
const ease = cubicBezier(0.45, 0.05, 0.2, 1);
const slot = (images: string[], i: number) => (images.length ? images[i % images.length] || undefined : undefined);
const hidden: CSSProperties = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

/** Nội dung một ô: ảnh nếu có, không thì ô màu nhấn có chữ. */
function Art({ src, accent, i, text }: { src?: string; accent: string; i: number; text?: string }) {
  if (src) return <img src={src} alt="" draggable={false} className="size-full object-cover" />;
  return (
    <div
      className="flex size-full items-center justify-center px-[1cqw] text-center"
      style={{
        background: `linear-gradient(145deg, ${mix(accent, 82 - (i % 3) * 12, "#fff")}, ${mix(accent, 72, "#000")})`,
        color: "rgba(255,255,255,0.94)",
        fontFamily: SERIF,
        fontSize: "2.2cqw",
        lineHeight: 1.2,
      }}
    >
      {text ?? "♥"}
    </div>
  );
}

/* ====================== 1. Xòe quạt 3D ====================== */

const FAN_N = 7;
const FAN_STEP = 10; // độ giữa hai thiệp liền kề

/** Các thiệp chồng nhau, xòe dần thành quạt quanh một điểm phía dưới. Mọi thiệp song song nhau (chỉ khác độ sâu). */
export function FanScene(props: SceneProps) {
  const { p, hero } = props;
  const e = useTransform(p, [0.04, 0.5], [0, 1], { ease });
  const rotX = useTransform(p, [0, 1], [-10, -18]);
  const rotY = useTransform(p, [0.5, 1], [0, 16]);
  return (
    <Stage {...props} preset="fan" shift={20} hint="Cuộn để xòe thiệp">
      <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d", rotateX: rotX, rotateY: rotY }}>
        {Array.from({ length: FAN_N }, (_, i) => (
          <FanCard key={i} i={i} e={e} src={slot(hero.images, i)} accent={hero.accent} />
        ))}
      </motion.div>
    </Stage>
  );
}

function FanCard({ i, e, src, accent }: { i: number; e: MotionValue<number>; src?: string; accent: string }) {
  const mid = (FAN_N - 1) / 2;
  const angle = useTransform(e, (v) => (i - mid) * FAN_STEP * v);
  return (
    <motion.div
      className="absolute overflow-hidden rounded-[1cqw]"
      style={{
        left: "calc(50% - 7.5cqw)",
        top: "calc(50% - 11cqw)",
        width: "15cqw",
        height: "21cqw",
        border: "0.5cqw solid #fffdf8",
        boxShadow: "0 1.4cqw 2.4cqw -0.8cqw rgba(0,0,0,0.45)",
        transformOrigin: "50% 230%",
        rotate: angle,
        z: i * 4,
      }}
    >
      <Art src={src} accent={accent} i={i} />
    </motion.div>
  );
}

/* ====================== 2. Album lật trang 3D (4 trang) ====================== */

/**
 * Album 4 trang gồm 2 tờ, mỗi tờ hai mặt:
 * - Tờ 1: mặt trước là trang 1 (bên phải lúc đầu), mặt sau là trang 2 (bên trái sau khi lật).
 * - Tờ 2: mặt trước là trang 3 (nằm dưới tờ 1 ở bên phải), mặt sau là trang 4 (bên trái sau khi lật).
 */
const BOOK_WINDOWS: [number, number][] = [
  [0.1, 0.4],
  [0.5, 0.8],
];

export function BookScene(props: SceneProps) {
  const { p, hero } = props;
  const accent = hero.accent;
  return (
    <Stage {...props} preset="book" hint="Cuộn để lật album">
      <div className="absolute" style={{ left: "24cqw", top: "13cqw", width: "52cqw", height: "34cqw", perspective: 1800 }}>
        <div className="absolute" style={{ inset: 0, transformStyle: "preserve-3d" }}>
          {/* Nền: trang trái trống lúc đầu, trang phải trống sau khi lật hết */}
          <div className="absolute overflow-hidden rounded-l-[0.8cqw]" style={{ left: 0, top: 0, width: "26cqw", height: "34cqw", background: CREAM_PAPER, boxShadow: "inset -1cqw 0 2cqw -1.4cqw rgba(0,0,0,0.25), 0 1.4cqw 2.4cqw -1cqw rgba(0,0,0,0.35)", transform: "translateZ(-6px)" }} />
          <div className="absolute overflow-hidden rounded-r-[0.8cqw]" style={{ left: "26cqw", top: 0, width: "26cqw", height: "34cqw", background: CREAM_PAPER, boxShadow: "inset 1cqw 0 2cqw -1.4cqw rgba(0,0,0,0.25), 0 1.4cqw 2.4cqw -1cqw rgba(0,0,0,0.35)", transform: "translateZ(-6px)" }} />
          {BOOK_WINDOWS.map(([a, b], i) => (
            <BookLeaf
              key={i}
              i={i}
              from={a}
              to={b}
              p={p}
              front={slot(hero.images, i * 2)}
              back={slot(hero.images, i * 2 + 1)}
              frontText={`Trang ${i * 2 + 1}`}
              backText={`Trang ${i * 2 + 2}`}
              accent={accent}
            />
          ))}
        </div>
      </div>
    </Stage>
  );
}

function BookLeaf({ i, from, to, p, front, back, frontText, backText, accent }: {
  i: number; from: number; to: number; p: MotionValue<number>;
  front?: string; back?: string; frontText: string; backText: string; accent: string;
}) {
  const angle = useTransform(p, [from, to], [0, -180], { ease });
  // Hai tờ cùng quay quanh gáy nên cùng mặt phẳng lúc nằm yên: tách độ sâu để không bị nhấp nháy.
  // Chưa lật: tờ 1 ở trên tờ 2. Đã lật sang trái: tờ lật sau nằm trên tờ lật trước.
  const z = useTransform(angle, (v) => (v > -90 ? (1 - i) * 3 : i * 3 + 3));
  return (
    <motion.div
      className="absolute"
      style={{ left: "26cqw", top: 0, width: "26cqw", height: "34cqw", transformOrigin: "0% 50%", transformStyle: "preserve-3d", rotateY: angle, z }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-r-[0.8cqw]" style={{ ...hidden, boxShadow: "0 0.6cqw 1.6cqw -0.6cqw rgba(0,0,0,0.35)" }}>
        <Art src={front} accent={accent} i={i * 2} text={frontText} />
      </div>
      <div className="absolute inset-0 overflow-hidden rounded-l-[0.8cqw]" style={{ ...hidden, transform: "rotateY(180deg)" }}>
        <Art src={back} accent={accent} i={i * 2 + 1} text={backText} />
      </div>
    </motion.div>
  );
}

/* ====================== 3. Hoa nở 3D ====================== */

const OUTER_N = 8;
const INNER_N = 8;

/**
 * Hai vòng cánh thiệp (dạng vòm) nở quanh một tâm vàng.
 * KHÔNG nghiêng từng cánh trong 3D (cách cũ làm các cánh cắt nhau thành hình nêm, nhìn rối).
 * Mọi cánh nằm trong các mặt phẳng song song, nở bằng dời ra ngoài + phóng to; thứ tự đè được cố định:
 * vòng ngoài: cánh lẻ đè lên cánh chẵn (xen kẽ đều như đóa hoa cúc), vòng trong luôn nằm trên vòng ngoài, tâm nằm trên cùng.
 * Chỉ cả đóa hoa nghiêng nhẹ như một khối cứng để có chiều sâu.
 */
export function FlowerScene(props: SceneProps) {
  const { p, hero } = props;
  const accent = hero.accent;
  const open = useTransform(p, [0.02, 0.6], [0, 1], { ease });
  const spin = useTransform(p, [0.6, 1], [0, 45]);
  const core = useTransform(p, [0.4, 0.66], [0, 1]);
  const tiltX = useTransform(p, [0, 0.6], [-6, -20]);
  return (
    <Stage {...props} preset="flower" hint="Cuộn để hoa nở">
      <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d", rotateX: tiltX }}>
        <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d", rotateZ: spin }}>
          {Array.from({ length: OUTER_N }, (_, i) => (
            <Bloom key={`o${i}`} open={open} angle={i * (360 / OUTER_N)} w={12.5} h={19} reach={7} z={i % 2 ? 12 : 0} src={slot(hero.images, i)} accent={accent} idx={i} />
          ))}
          {Array.from({ length: INNER_N }, (_, i) => (
            <Bloom key={`i${i}`} open={open} angle={i * (360 / INNER_N) + 360 / INNER_N / 2} w={8.4} h={13} reach={3.2} z={40 + (i % 2 ? 12 : 0)} src={slot(hero.images, i + OUTER_N)} accent={accent} idx={i + 3} />
          ))}
          <motion.div
            aria-hidden
            className="absolute flex items-center justify-center rounded-full"
            style={{
              left: "calc(50% - 4.2cqw)",
              top: "calc(50% - 4.2cqw)",
              width: "8.4cqw",
              height: "8.4cqw",
              z: 90,
              scale: core,
              background: `radial-gradient(circle at 35% 30%, ${mix(GOLD, 60, "#fff")}, ${GOLD} 60%, ${mix(GOLD, 70, "#000")})`,
              boxShadow: "0 0.8cqw 2cqw rgba(0,0,0,0.3), inset 0 0 0 0.5cqw rgba(255,255,255,0.35)",
              color: "#fff",
              fontFamily: SCRIPT,
              fontSize: "4cqw",
            }}
          >
            ♥
          </motion.div>
        </motion.div>
      </motion.div>
    </Stage>
  );
}

/** Một cánh: đáy nằm tại tâm hoa, xoay quanh tâm theo `angle`, nở ra ngoài `reach` rồi phóng to. Hình vòm như tấm thiệp. */
function Bloom({ open, angle, w, h, reach, z, src, accent, idx }: { open: MotionValue<number>; angle: number; w: number; h: number; reach: number; z: number; src?: string; accent: string; idx: number }) {
  const transform = useTransform(open, (v) => `rotateZ(${angle}deg) translateY(${-reach * v}cqw) scale(${0.28 + 0.72 * v})`);
  return (
    <motion.div
      className="absolute"
      style={{ left: `calc(50% - ${w / 2}cqw)`, top: `calc(50% - ${h}cqw)`, width: `${w}cqw`, height: `${h}cqw`, transformOrigin: "50% 100%", transform, z }}
    >
      <div
        className="absolute inset-0 overflow-hidden p-[0.5cqw]"
        style={{ background: "#fffdf8", borderRadius: `${w}cqw ${w}cqw 0.9cqw 0.9cqw`, boxShadow: "0 0.8cqw 1.6cqw -0.5cqw rgba(0,0,0,0.42)" }}
      >
        <div className="size-full overflow-hidden" style={{ borderRadius: `${w}cqw ${w}cqw 0.5cqw 0.5cqw` }}>
          <Art src={src} accent={accent} i={idx} />
        </div>
      </div>
    </motion.div>
  );
}

/* ====================== 4. Khối xoay 3D ====================== */

const CUBE = 22;

/** Khối lập phương, sáu mặt là sáu ảnh (hoặc chữ). Cuộn để xoay quanh các trục (xoay cứng, các mặt không cắt nhau). */
export function CubeScene(props: SceneProps) {
  const { p, hero, categoryLabel } = props;
  const accent = hero.accent;
  const rotX = useTransform(p, [0, 0.5, 1], [-24, 10, -12]);
  const rotY = useTransform(p, [0, 1], [-30, 560], { ease });
  const scale = useTransform(p, [0, 0.12], [0.55, 1]);
  const half = CUBE / 2;
  const faces: { t: string; text: string }[] = [
    { t: `translateZ(${half}cqw)`, text: hero.title || categoryLabel },
    { t: `rotateY(180deg) translateZ(${half}cqw)`, text: hero.subtitle || "Trân trọng kính mời" },
    { t: `rotateY(90deg) translateZ(${half}cqw)`, text: categoryLabel },
    { t: `rotateY(-90deg) translateZ(${half}cqw)`, text: "♥" },
    { t: `rotateX(90deg) translateZ(${half}cqw)`, text: "Đón chờ bạn" },
    { t: `rotateX(-90deg) translateZ(${half}cqw)`, text: categoryLabel },
  ];
  return (
    <Stage {...props} preset="cube" hint="Cuộn để xoay khối">
      <motion.div
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          width: `${CUBE}cqw`,
          height: `${CUBE}cqw`,
          marginLeft: `-${half}cqw`,
          marginTop: `-${half}cqw`,
          transformStyle: "preserve-3d",
          rotateX: rotX,
          rotateY: rotY,
          scale,
        }}
      >
        {faces.map((f, i) => (
          <div key={i} className="absolute inset-0 overflow-hidden rounded-[1cqw]" style={{ transform: f.t, border: "0.3cqw solid rgba(255,255,255,0.7)", ...hidden }}>
            <Art src={slot(hero.images, i)} accent={accent} i={i} text={f.text} />
          </div>
        ))}
      </motion.div>
      <div aria-hidden className="absolute rounded-[50%]" style={{ left: "calc(50% - 12cqw)", top: `calc(50% + ${half + 4}cqw)`, width: "24cqw", height: "3cqw", background: "rgba(40,20,20,0.3)", filter: "blur(1.6cqw)" }} />
    </Stage>
  );
}
