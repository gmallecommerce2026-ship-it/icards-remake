// src/components/invitation/envelope/flapDebug.ts
// Công cụ debug cho animation nắp phong bì. KHÔNG ảnh hưởng gì khi tắt (mặc định tắt).
//
// Bật:  thêm  ?flapdebug=1  vào URL (được nhớ trong localStorage).  Tắt: ?flapdebug=0  hoặc nút "Tắt" trên panel.
// Log:  mọi sự kiện được ghi vào  window.__flapLog  và in ra console với tiền tố [flapdbg].

export type DbgEntry = { ms: number; ev: string; data?: unknown };

const MAX = 600;
let enabled: boolean | null = null;
const t0 = typeof performance !== 'undefined' ? performance.now() : 0;

export const dbgLog: DbgEntry[] = [];

export function isDbgOn(): boolean {
  if (typeof window === 'undefined') return false;
  if (enabled !== null) return enabled;
  try {
    const q = new URLSearchParams(window.location.search).get('flapdebug');
    if (q === '1') window.localStorage.setItem('flapdebug', '1');
    else if (q === '0') window.localStorage.removeItem('flapdebug');
    enabled = window.localStorage.getItem('flapdebug') === '1';
  } catch {
    enabled = false;
  }
  return enabled;
}

export function setDbgOn(v: boolean) {
  enabled = v;
  try {
    if (v) window.localStorage.setItem('flapdebug', '1');
    else window.localStorage.removeItem('flapdebug');
  } catch { /* bỏ qua */ }
}

let hinted = false;
export function dbg(ev: string, data?: unknown) {
  if (!isDbgOn()) {
    if (!hinted && typeof window !== 'undefined') {
      hinted = true;
      // eslint-disable-next-line no-console
      console.info('[flapdbg] debug đang TẮT. Bật: nhấn Ctrl+Shift+D (hoặc chạy localStorage.setItem("flapdebug","1") rồi tải lại trang).');
    }
    return;
  }
  const e: DbgEntry = { ms: Math.round(performance.now() - t0), ev, data };
  dbgLog.push(e);
  if (dbgLog.length > MAX) dbgLog.shift();
  (window as unknown as { __flapLog?: DbgEntry[] }).__flapLog = dbgLog;
  // eslint-disable-next-line no-console
  console.log('%c[flapdbg]', 'color:#e0663a;font-weight:700', e.ms + 'ms', ev, data ?? '');
}
