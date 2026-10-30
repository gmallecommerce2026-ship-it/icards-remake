import { PortfolioItem } from "@/lib/professional";

export default function PortfolioCover({ item, className = "" }: { item: PortfolioItem; className?: string }) {
  // Minh họa giao diện độc quyền bằng CSS thay vì dùng ảnh thật
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl ${className}`}
      style={{ backgroundColor: item.tone.bg }}
      aria-hidden="true"
    >
      <div 
        className="relative h-[75%] aspect-[9/16] rounded-[1.5rem] bg-white shadow-xl transition-transform duration-500 hover:scale-105"
        style={{ boxShadow: `0 20px 40px -15px ${item.tone.ink}40` }}
      >
        {/* Giả lập các thành phần của một thiệp điện tử cao cấp */}
        <div className="absolute inset-x-6 top-8 h-24 rounded-t-full border border-b-0 opacity-20" style={{ borderColor: item.tone.ink }} />
        <div className="absolute inset-x-12 top-20 h-1 rounded-full opacity-60" style={{ backgroundColor: item.tone.ink }} />
        <div className="absolute inset-x-16 top-24 h-[2px] rounded-full opacity-30" style={{ backgroundColor: item.tone.ink }} />
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] opacity-80" style={{ borderColor: item.tone.ink }} />
        <div className="absolute inset-x-10 bottom-16 h-1 rounded-full opacity-40" style={{ backgroundColor: item.tone.ink }} />
        <div className="absolute inset-x-14 bottom-12 h-[2px] rounded-full opacity-20" style={{ backgroundColor: item.tone.ink }} />
      </div>
    </div>
  );
}