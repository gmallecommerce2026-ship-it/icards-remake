// src/components/invitation/editor/readImage.ts
// Đọc ảnh người dùng chọn và thu nhỏ (cạnh dài tối đa 1400px) để bản nháp lưu trong trình duyệt không bị đầy.
export function readImage(file: File, max = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => {
      const src = String(r.result);
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') { resolve(src); return; }
      const im = new Image();
      im.onerror = () => resolve(src);
      im.onload = () => {
        const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
        if (k === 1 && file.size < 400_000) { resolve(src); return; }
        const c = document.createElement('canvas');
        c.width = Math.round(im.naturalWidth * k);
        c.height = Math.round(im.naturalHeight * k);
        c.getContext('2d')?.drawImage(im, 0, 0, c.width, c.height);
        resolve(c.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.86));
      };
      im.src = src;
    };
    r.readAsDataURL(file);
  });
}

export function imageRatio(src: string): Promise<number> {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im.naturalWidth / (im.naturalHeight || 1));
    im.onerror = () => resolve(1);
    im.src = src;
  });
}
