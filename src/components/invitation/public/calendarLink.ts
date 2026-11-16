/**
 * Tạo link "Thêm vào Google Lịch" cho sự kiện.
 * - Ngày lấy từ eventDate (ISO, lưu khi chủ thiệp chọn ngày) để chính xác; nếu thiếu thì đọc ngày dạng chữ (dd/mm/yyyy).
 * - Giờ đọc từ ô "Giờ" (ví dụ "18:00", "18h30", "6 giờ chiều"). Không có giờ -> sự kiện cả ngày.
 * - Mọi giờ tính theo Việt Nam (UTC+7), Google Lịch được gửi kèm múi giờ Asia/Ho_Chi_Minh.
 */

export type CalendarInput = {
  title: string;
  eventDate?: string | null;
  dateText?: string;
  timeText?: string;
  venue?: string;
  address?: string;
  host?: string;
  pageUrl: string;
};

type Day = { y: number; m: number; d: number };
type Clock = { h: number; min: number };

const VN_OFFSET_MS = 7 * 3600_000;
/** Thời lượng ước lượng khi chỉ có giờ bắt đầu (tiệc cưới/sinh nhật thường 2–3 giờ) */
const DEFAULT_DURATION_MS = 3 * 3600_000;
const pad = (n: number) => String(n).padStart(2, "0");

function vnDay(d: Date): Day {
  const v = new Date(d.getTime() + VN_OFFSET_MS);
  return { y: v.getUTCFullYear(), m: v.getUTCMonth() + 1, d: v.getUTCDate() };
}

function parseDayText(text?: string): Day | null {
  const m = text?.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/);
  if (!m) return null;
  const day = { d: Number(m[1]), m: Number(m[2]), y: Number(m[3]) };
  return day.m >= 1 && day.m <= 12 && day.d >= 1 && day.d <= 31 ? day : null;
}

function parseClockText(text?: string): Clock | null {
  if (!text) return null;
  const m = text.match(/(\d{1,2})\s*(?:[:hH.]|giờ)?\s*(\d{2})?/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  // "6 giờ chiều", "7 giờ tối" -> 18h, 19h
  if (/chiều|tối|đêm/i.test(text) && h < 12) h += 12;
  if (h > 23 || min > 59) return null;
  return { h, min };
}

function resolveDay(eventDate?: string | null, dateText?: string): Day | null {
  if (eventDate) {
    const dt = new Date(eventDate);
    if (!Number.isNaN(dt.getTime())) return vnDay(dt);
  }
  return parseDayText(dateText);
}

/** Trả về null khi không đủ thông tin ngày (khi đó không hiển thị nút). */
export function buildGoogleCalendarUrl(i: CalendarInput): string | null {
  const day = resolveDay(i.eventDate, i.dateText);
  if (!day) return null;

  const clock = parseClockText(i.timeText);
  let dates: string;
  if (clock) {
    const startMs = Date.UTC(day.y, day.m - 1, day.d, clock.h, clock.min) - VN_OFFSET_MS;
    const stamp = (ms: number) => {
      // ghi theo giờ VN (cộng offset, đọc phần UTC) dạng "thời gian địa phương" đi kèm ctz
      const v = new Date(ms + VN_OFFSET_MS);
      return `${v.getUTCFullYear()}${pad(v.getUTCMonth() + 1)}${pad(v.getUTCDate())}T${pad(v.getUTCHours())}${pad(v.getUTCMinutes())}00`;
    };
    dates = `${stamp(startMs)}/${stamp(startMs + DEFAULT_DURATION_MS)}`;
  } else {
    const next = new Date(Date.UTC(day.y, day.m - 1, day.d + 1));
    const ymd = (y: number, m: number, d: number) => `${y}${pad(m)}${pad(d)}`;
    dates = `${ymd(day.y, day.m, day.d)}/${ymd(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate())}`;
  }

  const location = [i.venue, i.address].filter(Boolean).join(" - ");
  const details = [
    i.host ? `Chủ nhà: ${i.host}` : "",
    `Xem chi tiết và xác nhận tham dự: ${i.pageUrl}`,
  ].filter(Boolean).join("\n");

  const params: Array<[string, string]> = [
    ["action", "TEMPLATE"],
    ["text", i.title],
    ["dates", dates],
    ["details", details],
    ["location", location],
    ["ctz", "Asia/Ho_Chi_Minh"],
  ];
  return "https://calendar.google.com/calendar/render?" + params
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
}

/** Ngày hiển thị cho người xem: ưu tiên chữ chủ thiệp đã nhập, nếu không có thì định dạng từ eventDate. */
export function displayWhen(i: { eventDate?: string | null; dateText?: string; timeText?: string }): string {
  let date = i.dateText?.trim() ?? "";
  if (!date && i.eventDate) {
    const dt = new Date(i.eventDate);
    if (!Number.isNaN(dt.getTime())) {
      const d = vnDay(dt);
      date = `${pad(d.d)}/${pad(d.m)}/${d.y}`;
    }
  }
  return [date, i.timeText?.trim()].filter(Boolean).join(" · ");
}
