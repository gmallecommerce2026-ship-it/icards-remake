"use client";

const CRIMSON = "#A3152F";

/** Một dòng bật/tắt trong khối cài đặt sự kiện */
export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-black/10 py-3 text-sm">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5" style={{ accentColor: CRIMSON }} />
    </label>
  );
}

export type EventSettingsValue = {
  showRsvp: boolean;
  setShowRsvp: (v: boolean) => void;
  showGuests: boolean;
  setShowGuests: (v: boolean) => void;
};

/**
 * Khối "Cài đặt sự kiện" DUY NHẤT trong toàn bộ luồng thiệp.
 * Dùng cho cả bảng "Cài đặt" (rail bên trái) lẫn phần cuối trang, để hai nơi luôn giống hệt nhau.
 */
export function EventSettings({ showRsvp, setShowRsvp, showGuests, setShowGuests }: EventSettingsValue) {
  return (
    <>
      <Toggle label="Hiện nút phản hồi tham dự" checked={showRsvp} onChange={setShowRsvp} />
      <Toggle label="Hiện danh sách khách mời" checked={showGuests} onChange={setShowGuests} />
    </>
  );
}
