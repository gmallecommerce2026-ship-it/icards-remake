// src/components/invitation/editor/Toolbars.tsx
'use client';

import { useRef, useState } from 'react';
import { FONTS, PALETTE } from './editor.data';
import { readImage } from './readImage';
import { useEditorStore, type Align, type CardEl } from './useEditorStore';
import e from './editor.module.css';

const IC = {
  flipH: ['M12 3v18', 'M8 7l-5 5 5 5z', 'M16 7l5 5-5 5z'],
  flipV: ['M3 12h18', 'M7 8l5-5 5 5z', 'M7 16l5 5 5-5z'],
  up: ['M12 4l8 4-8 4-8-4z', 'M4 12l8 4 8-4'],
  down: ['M12 20l8-4-8-4-8 4z', 'M4 12l8-4 8 4'],
  dup: ['M9 9h11v11H9z', 'M4 15V4h11'],
  del: ['M5 7h14', 'M10 7V4h4v3', 'M7 7l1 13h8l1-13'],
  left: ['M4 6h16', 'M4 10h10', 'M4 14h16', 'M4 18h10'],
  center: ['M4 6h16', 'M7 10h10', 'M4 14h16', 'M7 18h10'],
  right: ['M4 6h16', 'M10 10h10', 'M4 14h16', 'M10 18h10'],
};
export function Icon({ k, size = 22 }: { k: keyof typeof IC; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {IC[k].map((p) => <path key={p} d={p} />)}
    </svg>
  );
}

/** Bảng màu: onBegin gọi trước khi đổi (để lưu mốc undo), onPick gọi mỗi lần đổi */
export function ColorGrid({ value, onPick, onBegin }: { value?: string; onPick: (c: string) => void; onBegin?: () => void }) {
  return (
    <div className={e.palette}>
      {PALETTE.map((c) => (
        <button key={c} type="button" className={e.sw} style={{ background: c }} aria-label={c} aria-pressed={value === c}
          onClick={() => { onBegin?.(); onPick(c); }} />
      ))}
      <label className={e.custom}>
        Màu tùy chọn
        <input type="color" onFocus={onBegin} onChange={(ev) => onPick(ev.target.value)} />
      </label>
    </div>
  );
}

export function TextToolbar({ el }: { el: CardEl }) {
  const patch = useEditorStore((s) => s.patch);
  const checkpoint = useEditorStore((s) => s.checkpoint);
  const [pop, setPop] = useState(false);
  const set = (p: Partial<CardEl>) => { checkpoint(); patch(el.id, p); };
  const size = Math.round(el.size ?? 32);
  const aligns: Align[] = ['left', 'center', 'right'];
  const nextAlign = aligns[(aligns.indexOf(el.align ?? 'center') + 1) % 3];

  return (
    <div className={e.textbar} onPointerDown={(ev) => ev.stopPropagation()}>
      <select value={el.font} onChange={(ev) => set({ font: ev.target.value })} aria-label="Phông chữ" style={{ fontFamily: `'${el.font}'` }}>
        {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>
      <select value={el.bold ? 'b' : 'r'} onChange={(ev) => set({ bold: ev.target.value === 'b' })} aria-label="Độ đậm">
        <option value="r">Thường</option>
        <option value="b">Đậm</option>
      </select>
      <div className={e.stepper}>
        <button type="button" aria-label="Giảm cỡ chữ" onClick={() => set({ size: Math.max(8, size - 2) })}>−</button>
        <span>{size}</span>
        <button type="button" aria-label="Tăng cỡ chữ" onClick={() => set({ size: Math.min(240, size + 2) })}>+</button>
      </div>
      <div className={e.colorWrap}>
        <button type="button" className={e.colorBtn} style={{ background: el.color }} aria-label="Màu chữ" onClick={() => setPop((v) => !v)} />
        {pop && (
          <div className={e.pop}>
            <ColorGrid value={el.color} onBegin={checkpoint} onPick={(c) => patch(el.id, { color: c })} />
          </div>
        )}
      </div>
      <button type="button" className={e.tbtn} aria-label="Căn lề" onClick={() => set({ align: nextAlign })}>
        <Icon k={el.align === 'left' ? 'left' : el.align === 'right' ? 'right' : 'center'} />
      </button>
    </div>
  );
}

function Btn({ label, k, onClick }: { label: string; k: keyof typeof IC; onClick: () => void }) {
  return <button type="button" className={e.act} aria-label={label} title={label} onClick={onClick}><Icon k={k} /></button>;
}

export function ActionBar({ el }: { el: CardEl }) {
  const { patch, checkpoint, remove, duplicate, reorder } = useEditorStore.getState();
  const flip = (k: 'flipX' | 'flipY') => { checkpoint(); patch(el.id, { [k]: !el[k] }); };
  return (
    <div className={e.actionbar} onPointerDown={(ev) => ev.stopPropagation()}>
      {el.kind !== 'text' && <><Btn label="Lật ngang" k="flipH" onClick={() => flip('flipX')} /><Btn label="Lật dọc" k="flipV" onClick={() => flip('flipY')} /></>}
      <Btn label="Đưa lên trên" k="up" onClick={() => reorder(el.id, 1)} />
      <Btn label="Đưa xuống dưới" k="down" onClick={() => reorder(el.id, -1)} />
      <Btn label="Nhân đôi" k="dup" onClick={() => duplicate(el.id)} />
      <Btn label="Xóa" k="del" onClick={() => remove(el.id)} />
    </div>
  );
}

/** Thanh định dạng cho hình khối / đồ họa / 3D / nét vẽ / khung ảnh: màu, độ đục, đổi ảnh. */
export function StyleBar({ el }: { el: CardEl }) {
  const patch = useEditorStore((s) => s.patch);
  const checkpoint = useEditorStore((s) => s.checkpoint);
  const setFrameImage = useEditorStore((s) => s.setFrameImage);
  const [pop, setPop] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const hasColor = el.kind !== 'image' && el.kind !== 'frame';
  const opacity = Math.round((el.op ?? 1) * 100);

  return (
    <div className={e.textbar} onPointerDown={(ev) => ev.stopPropagation()}>
      {hasColor && (
        <div className={e.colorWrap}>
          <button type="button" className={e.colorBtn} style={{ background: el.color }} aria-label="Màu" onClick={() => setPop((v) => !v)} />
          {pop && (
            <div className={e.pop}>
              <ColorGrid value={el.color} onBegin={checkpoint} onPick={(c) => patch(el.id, { color: c })} />
            </div>
          )}
        </div>
      )}
      {el.kind === 'frame' && (
        <>
          <button type="button" className={e.pill} onClick={() => file.current?.click()}>{el.src ? 'Đổi ảnh' : 'Thêm ảnh'}</button>
          {el.src && <button type="button" className={e.pill} onClick={() => setFrameImage(el.id, undefined)}>Gỡ ảnh</button>}
          <input ref={file} type="file" accept="image/*" hidden
            onChange={async (ev) => { const f = ev.target.files?.[0]; ev.target.value = ''; if (f) setFrameImage(el.id, await readImage(f)); }} />
        </>
      )}
      {el.kind !== 'draw' && (
        <label className={e.range}>
          Độ đục
          <input type="range" min={10} max={100} value={opacity} onPointerDown={() => checkpoint()} onChange={(ev) => patch(el.id, { op: Number(ev.target.value) / 100 })} />
          <span>{opacity}%</span>
        </label>
      )}
    </div>
  );
}
