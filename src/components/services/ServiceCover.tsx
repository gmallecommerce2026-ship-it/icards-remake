import { Service } from "@/lib/services";

export default function ServiceCover({ service, className = "" }: { service: Service; className?: string }) {
  // Thay vì dùng ảnh, vẽ graphic trừu tượng dựa trên tone màu
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl ${className}`}
      style={{ backgroundColor: service.tone.bg }}
      aria-hidden="true"
    >
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(${service.tone.ink} 2px, transparent 2px)`,
          backgroundSize: '24px 24px'
        }}
      />
      <div 
        className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
      >
        <div className="h-10 w-10 rounded-full border-4" style={{ borderColor: service.tone.ink, opacity: 0.8 }} />
        <div className="absolute h-4 w-4 rounded-full" style={{ backgroundColor: service.tone.ink }} />
      </div>
    </div>
  );
}