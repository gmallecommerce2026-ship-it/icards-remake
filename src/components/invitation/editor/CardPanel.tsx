// src/components/invitation/editor/CardPanel.tsx
'use client';

import { useState } from 'react';
import { BACKDROPS, STICKERS, StickerArt } from './editor.data';
import { ColorGrid } from './Toolbars';
import { useEditorStore } from './useEditorStore';
import p from './CardPanel.module.css';

type Sub = 'backdrop' | 'sticker' | 'text' | 'image';
const SUBS: { id: Sub; label: string }[] = [
  { id: 'backdrop', label: 'Nền' },
  { id: 'sticker', label: 'Hình dán' },
  { id: 'text', label: 'Chữ' },
  { id: 'image', label: 'Ảnh' },
];

const TEXT_PRESETS = [
  { label: 'Thêm tiêu đề', size: 64, bold: true, font: 'Playfair Display', text: 'Tiêu đề' },
  { label: 'Thêm tiêu đề phụ', size: 36, bold: true, font: 'Be Vietnam Pro', text: 'Tiêu đề phụ' },
  { label: 'Thêm nội dung', size: 22, bold: false, font: 'Be Vietnam Pro', text: 'Nội dung văn bản' },
];

export function CardPanel() {
  const [sub, setSub] = useState<Sub>('backdrop');
  const page = useEditorStore((s) => s.page);
  const bg = useEditorStore((s) => s.backdrops[s.page]);
  const sel = useEditorStore((s) => {
    for (const pg of ['cover', 'inside'] as const) {
      const f = s.pages[pg].find((x) => x.id === s.selectedId);
      if (f) return f;
    }
    return null;
  });
  const { setBackdrop, checkpoint, patch, addSticker, addText, addImage } = useEditorStore.getState();

  function onFile(f?: File) {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const src = String(r.result);
      const im = new Image();
      im.onload = () => addImage(src, im.naturalWidth / (im.naturalHeight || 1));
      im.src = src;
    };
    r.readAsDataURL(f);
  }

  return (
    <div>
      <p className={p.where}>Đang chỉnh: <b>{page === 'cover' ? 'Mặt ngoài' : 'Mặt trong'}</b></p>
      <div className={p.seg} role="tablist">
        {SUBS.map((x) => (
          <button key={x.id} type="button" role="tab" className={p.segBtn} aria-selected={sub === x.id} onClick={() => setSub(x.id)}>{x.label}</button>
        ))}
      </div>

      {sub === 'backdrop' && (
        <div className={p.grid}>
          {BACKDROPS.map((b) => (
            <button key={b} type="button" className={p.swatch} style={{ background: b }} aria-label={b} aria-pressed={bg === b} onClick={() => setBackdrop(b)} />
          ))}
          <label className={p.custom}>
            Màu tùy chọn
            <input type="color" onFocus={() => checkpoint()} onChange={(ev) => setBackdrop(ev.target.value, false)} />
          </label>
        </div>
      )}

      {sub === 'sticker' && (
        <>
          <div className={p.grid}>
            {STICKERS.map((s) => (
              <button key={s.id} type="button" className={p.item} aria-label={s.name} title={s.name} onClick={() => addSticker(s.id)}>
                <StickerArt id={s.id} color="#333" />
              </button>
            ))}
          </div>
          {sel?.kind === 'sticker' && (
            <>
              <p className={p.label}>Màu hình dán</p>
              <ColorGrid value={sel.color} onBegin={checkpoint} onPick={(c) => patch(sel.id, { color: c })} />
            </>
          )}
        </>
      )}

      {sub === 'text' && (
        <div className={p.stack}>
          {TEXT_PRESETS.map((t) => (
            <button key={t.label} type="button" className={p.preset} style={{ fontFamily: `'${t.font}'`, fontWeight: t.bold ? 700 : 400, fontSize: Math.min(t.size, 30) }}
              onClick={() => addText({ text: t.text, size: t.size, bold: t.bold, font: t.font })}>
              {t.label}
            </button>
          ))}
          <p className={p.hint}>Nhấn đúp vào chữ trên thiệp để sửa nội dung.</p>
        </div>
      )}

      {sub === 'image' && (
        <label className={p.upload}>
          Tải ảnh lên
          <input type="file" accept="image/*" hidden onChange={(ev) => { onFile(ev.target.files?.[0]); ev.target.value = ''; }} />
        </label>
      )}
    </div>
  );
}