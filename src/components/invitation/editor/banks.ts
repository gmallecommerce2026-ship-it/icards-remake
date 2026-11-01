// src/components/invitation/editor/banks.ts
// Danh sách ngân hàng hỗ trợ VietQR. Có sẵn bản dự phòng (chạy offline); khi có mạng sẽ làm mới từ API công khai
// của vietqr.io (không cần khoá, không gửi dữ liệu cá nhân) và lưu đệm 24 giờ vì danh sách này thay đổi theo thời gian.
'use client';

import { useEffect, useState } from 'react';

export type Bank = { bin: string; shortName: string; name: string };

export const FALLBACK_BANKS: Bank[] = [
  { bin: '970436', shortName: 'Vietcombank', name: 'Ngân hàng TMCP Ngoại thương Việt Nam' },
  { bin: '970415', shortName: 'VietinBank', name: 'Ngân hàng TMCP Công thương Việt Nam' },
  { bin: '970418', shortName: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam' },
  { bin: '970405', shortName: 'Agribank', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam' },
  { bin: '970407', shortName: 'Techcombank', name: 'Ngân hàng TMCP Kỹ thương Việt Nam' },
  { bin: '970422', shortName: 'MB Bank', name: 'Ngân hàng TMCP Quân đội' },
  { bin: '970416', shortName: 'ACB', name: 'Ngân hàng TMCP Á Châu' },
  { bin: '970432', shortName: 'VPBank', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng' },
  { bin: '970423', shortName: 'TPBank', name: 'Ngân hàng TMCP Tiên Phong' },
  { bin: '970403', shortName: 'Sacombank', name: 'Ngân hàng TMCP Sài Gòn Thương Tín' },
  { bin: '970437', shortName: 'HDBank', name: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh' },
  { bin: '970441', shortName: 'VIB', name: 'Ngân hàng TMCP Quốc tế Việt Nam' },
  { bin: '970443', shortName: 'SHB', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội' },
  { bin: '970426', shortName: 'MSB', name: 'Ngân hàng TMCP Hàng Hải Việt Nam' },
  { bin: '970448', shortName: 'OCB', name: 'Ngân hàng TMCP Phương Đông' },
  { bin: '970440', shortName: 'SeABank', name: 'Ngân hàng TMCP Đông Nam Á' },
  { bin: '970449', shortName: 'LPBank', name: 'Ngân hàng TMCP Lộc Phát Việt Nam' },
  { bin: '970431', shortName: 'Eximbank', name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam' },
  { bin: '970429', shortName: 'SCB', name: 'Ngân hàng TMCP Sài Gòn' },
  { bin: '970428', shortName: 'Nam A Bank', name: 'Ngân hàng TMCP Nam Á' },
  { bin: '970409', shortName: 'BacABank', name: 'Ngân hàng TMCP Bắc Á' },
  { bin: '970425', shortName: 'ABBANK', name: 'Ngân hàng TMCP An Bình' },
  { bin: '970433', shortName: 'VietBank', name: 'Ngân hàng TMCP Việt Nam Thương Tín' },
  { bin: '970412', shortName: 'PVcomBank', name: 'Ngân hàng TMCP Đại chúng Việt Nam' },
  { bin: '970438', shortName: 'BaoVietBank', name: 'Ngân hàng TMCP Bảo Việt' },
  { bin: '970419', shortName: 'NCB', name: 'Ngân hàng TMCP Quốc Dân' },
  { bin: '970452', shortName: 'KienlongBank', name: 'Ngân hàng TMCP Kiên Long' },
  { bin: '970427', shortName: 'VietABank', name: 'Ngân hàng TMCP Việt Á' },
  { bin: '970430', shortName: 'PGBank', name: 'Ngân hàng TMCP Thịnh vượng và Phát triển' },
  { bin: '970400', shortName: 'SaigonBank', name: 'Ngân hàng TMCP Sài Gòn Công Thương' },
  { bin: '970446', shortName: 'Co-opBank', name: 'Ngân hàng Hợp tác xã Việt Nam' },
  { bin: '970424', shortName: 'Shinhan Bank', name: 'Ngân hàng TNHH MTV Shinhan Việt Nam' },
  { bin: '970457', shortName: 'Woori Bank', name: 'Ngân hàng TNHH MTV Woori Việt Nam' },
  { bin: '546034', shortName: 'CAKE', name: 'Ngân hàng số CAKE by VPBank' },
  { bin: '546035', shortName: 'Ubank', name: 'Ngân hàng số Ubank by VPBank' },
  { bin: '963388', shortName: 'Timo', name: 'Ngân hàng số Timo by Ban Viet Bank' },
];

const KEY = 'icards:banks:v1';
const TTL = 24 * 60 * 60 * 1000;

type ApiBank = { bin?: string; shortName?: string; name?: string; transferSupported?: number };
const parse = (list: ApiBank[]): Bank[] =>
  list
    .filter((b) => b.transferSupported !== 0 && /^\d{6}$/.test(b.bin ?? '') && b.shortName)
    .map((b) => ({ bin: b.bin as string, shortName: b.shortName as string, name: b.name ?? (b.shortName as string) }));

/** Trả về danh sách ngân hàng (dự phòng ngay lập tức, thay bằng danh sách mới nhất nếu tải được). */
export function useBanks(): { banks: Bank[]; live: boolean } {
  const [state, setState] = useState<{ banks: Bank[]; live: boolean }>({ banks: FALLBACK_BANKS, live: false });

  useEffect(() => {
    let dead = false;
    const ctl = new AbortController();
    let fresh = false;
    let cached: Bank[] | null = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const c = JSON.parse(raw) as { t: number; data: Bank[] };
        if (Array.isArray(c.data) && c.data.length > 10) { cached = c.data; fresh = Date.now() - c.t < TTL; }
      }
    } catch { /* đọc đệm lỗi thì bỏ qua */ }
    // cập nhật state trong callback (không đồng bộ trong thân effect) để tránh render lan truyền
    if (cached) queueMicrotask(() => { if (!dead) setState({ banks: cached as Bank[], live: true }); });
    if (fresh) return () => { dead = true; };

    const timer = setTimeout(() => ctl.abort(), 6000);
    fetch('https://api.vietqr.io/v2/banks', { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { data?: ApiBank[] }) => {
        const data = parse(j.data ?? []);
        if (dead || data.length < 10) return;
        setState({ banks: data, live: true });
        try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), data })); } catch { /* đầy bộ nhớ */ }
      })
      .catch(() => { /* offline / bị chặn CORS: giữ danh sách dự phòng */ })
      .finally(() => clearTimeout(timer));
    return () => { dead = true; clearTimeout(timer); ctl.abort(); };
  }, []);

  return state;
}
