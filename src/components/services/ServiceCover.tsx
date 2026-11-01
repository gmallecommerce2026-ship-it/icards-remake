import type { Service } from "@/lib/services";

// Service không còn trường `tone`: chọn màu theo slug để mỗi dịch vụ luôn có cùng một màu
const TONES = [
  { bg: "#E8EEF6", ink: "#27548A" },
  { bg: "#FBEDEE", ink: "#B5485D" },
  { bg: "#E6F3F3", ink: "#1F7373" },
  { bg: "#FFF1DF", ink: "#9A5A12" },
  { bg: "#EEEAFB", ink: "#5B43B8" },
];
const toneOf = (slug: string) => TONES[[...slug].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];

export default function ServiceCover({ service, className = "" }: { service: Service; className?: string }) {
  const tone = toneOf(service.slug);
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl ${className}`}
      style={{ backgroundColor: tone.bg }}
      aria-hidden="true"
    >
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(${tone.ink} 2px, transparent 2px)`,
          backgroundSize: '24px 24px'
        }}
      />
      <div 
        className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
      >
        <div className="h-10 w-10 rounded-full border-4" style={{ borderColor: tone.ink, opacity: 0.8 }} />
        <div className="absolute h-4 w-4 rounded-full" style={{ backgroundColor: tone.ink }} />
      </div>
    </div>
  );
}