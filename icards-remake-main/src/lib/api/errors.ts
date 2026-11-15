/** Lấy thông báo lỗi dễ đọc từ phản hồi lỗi của NestJS (message có thể là chuỗi hoặc mảng). */
export function apiErrorMessage(err: unknown, fallback = "Có lỗi xảy ra, vui lòng thử lại."): string {
  const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(" · ");
  if (typeof msg === "string") return msg;
  return fallback;
}
