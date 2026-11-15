// src/components/invitation/editor/vietqr.ts
// Tạo mã QR chuyển khoản ngân hàng theo chuẩn VietQR (NAPAS 247, nền EMVCo Merchant-Presented Mode).
// Toàn bộ chạy trên trình duyệt: số tài khoản không gửi đi đâu cả.
//
// Cấu trúc payload (mỗi trường = ID 2 số + độ dài 2 số + giá trị):
//   00 Payload format        "01"
//   01 Point of initiation   "11" (tĩnh, người chuyển tự nhập tiền) | "12" (động, có sẵn số tiền)
//   38 Consumer account      00 GUID "A000000727"
//                            01 -> 00 BIN ngân hàng + 01 số tài khoản
//                            02 Service code "QRIBFTTA" (chuyển nhanh 24/7 tới tài khoản)
//   53 Currency              "704" (VND)
//   54 Amount                (tuỳ chọn)
//   58 Country               "VN"
//   62 Additional data       08 Purpose of transaction = nội dung chuyển khoản (tuỳ chọn)
//   63 CRC-16/CCITT-FALSE    4 ký tự hex in hoa, tính trên toàn bộ chuỗi tới hết "6304"
import QRCode from 'qrcode';

const tlv = (id: string, value: string) => `${id}${String(value.length).padStart(2, '0')}${value}`;

/** CRC-16/CCITT-FALSE: poly 0x1021, init 0xFFFF, không đảo bit. Kiểm chứng: crc16("123456789") = "29B1". */
export function crc16(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= (input.charCodeAt(i) & 0xff) << 8;
    for (let b = 0; b < 8; b++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Bỏ dấu tiếng Việt (đ -> d) để hợp với trường nội dung của VietQR (chỉ nhận ký tự ASCII). */
export function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

export const MESSAGE_MAX = 25;
/** Nội dung chuyển khoản: bỏ dấu, chỉ giữ chữ - số - khoảng trắng - . , - _ ; tối đa 25 ký tự. */
export function cleanMessage(s: string): string {
  return stripDiacritics(s).replace(/[^A-Za-z0-9 .,_-]/g, '').replace(/\s+/g, ' ').trim().slice(0, MESSAGE_MAX);
}

export const cleanAccount = (s: string) => s.replace(/\D/g, '');

export type BankQrInput = { bin: string; account: string; amount?: number; message?: string };

/** Trả về thông báo lỗi tiếng Việt, hoặc null nếu hợp lệ. */
export function validateBankQr({ bin, account, amount }: BankQrInput): string | null {
  if (!/^\d{6}$/.test(bin)) return 'Hãy chọn ngân hàng thụ hưởng.';
  if (account.length < 6 || account.length > 19) return 'Số tài khoản gồm 6–19 chữ số.';
  if (amount !== undefined && (!Number.isInteger(amount) || amount < 1 || amount > 9_999_999_999)) return 'Số tiền phải là số nguyên từ 1 đồng trở lên.';
  return null;
}

export function buildVietQR({ bin, account, amount, message }: BankQrInput): string {
  const consumer = tlv('00', bin) + tlv('01', account);
  const merchant = tlv('00', 'A000000727') + tlv('01', consumer) + tlv('02', 'QRIBFTTA');
  let s = tlv('00', '01') + tlv('01', amount ? '12' : '11') + tlv('38', merchant) + tlv('53', '704');
  if (amount) s += tlv('54', String(amount));
  s += tlv('58', 'VN');
  const note = message ? cleanMessage(message) : '';
  if (note) s += tlv('62', tlv('08', note));
  s += '6304';
  return s + crc16(s);
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export type BankQrArt = { src: string; ratio: number };

/**
 * Dựng ảnh SVG: mã QR (vẽ trực tiếp từ ma trận module, mức sửa lỗi M) + tuỳ chọn ghi chú ngân hàng / chủ tài khoản / số tài khoản.
 * Ngân hàng quét mã cần độ tương phản cao nên nền luôn trắng; màu mã do người dùng chọn nhưng chỉ nên là màu tối.
 */
export function bankQrArt(o: { payload: string; dark: string; caption?: { bank: string; holder: string; account: string } }): BankQrArt {
  const qr = QRCode.create(o.payload, { errorCorrectionLevel: 'M' });
  const n = qr.modules.size;
  const C = 10;                       // cạnh một module
  const Q = 4 * C;                    // vùng trống bao quanh theo đặc tả QR (4 module)
  const W = n * C + Q * 2;

  let d = '';
  for (let y = 0; y < n; y++) {
    let x = 0;
    while (x < n) {
      if (!qr.modules.get(y, x)) { x++; continue; }
      let run = 1;
      while (x + run < n && qr.modules.get(y, x + run)) run++;
      d += `M${Q + x * C} ${Q + y * C}h${run * C}v${C}h-${run * C}z`;
      x += run;
    }
  }

  let H = W, text = '';
  if (o.caption) {
    const fs = Math.round(W * 0.062);
    const line = (t: string, y: number, weight: number, size: number) => {
      const wide = t.length * size * 0.62 > W * 0.9;     // dòng quá dài -> ép vừa chiều ngang để không tràn
      return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="#111"${wide ? ` textLength="${Math.round(W * 0.9)}" lengthAdjust="spacingAndGlyphs"` : ''}>${esc(t)}</text>`;
    };
    const top = W - Q * 0.35;
    text = line(o.caption.bank, top + fs, 700, fs) + line(o.caption.holder, top + fs * 2.3, 700, Math.round(fs * 0.95)) + line(o.caption.account, top + fs * 3.5, 400, Math.round(fs * 0.95));
    H = Math.round(top + fs * 4.4);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><path d="${d}" fill="${esc(o.dark)}"/>${text}</svg>`;
  return { src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, ratio: W / H };
}
