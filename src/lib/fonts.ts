// Thay thế next/font/google: build không cần kết nối tới Google.
// Font thật được nạp từ src/styles/local-fonts.css (sinh bởi `npm run fonts:build`).
// Mỗi hàm trả về `variable` là tên class định nghĩa biến CSS tương ứng.

type FontOptions = {
  variable?: string;
  subsets?: string[];
  weight?: string | string[];
  style?: string | string[];
  display?: string;
};

const local = (opts: FontOptions = {}) => ({
  variable: opts.variable ?? "",
  className: opts.variable ?? "",
});

export const Be_Vietnam_Pro = local;
export const Cormorant_Garamond = local;
export const Great_Vibes = local;
export const Space_Mono = local;
export const Oswald = local;
