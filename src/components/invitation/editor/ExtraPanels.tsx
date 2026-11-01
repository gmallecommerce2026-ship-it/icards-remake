// src/components/invitation/editor/ExtraPanels.tsx
// Các tab bổ sung kiểu Canva: Thương hiệu · Công cụ · Ứng dụng.
'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { FONTS } from './editor.data';
import { ColorGrid } from './Toolbars';
import { readImage, imageRatio } from './readImage';
import { useBrandStore } from './useBrandStore';
import { PAGES, useEditorStore, type AlignTo, type CardEl } from './useEditorStore';
import p from './CardPanel.module.css';

const selectedEl = (s: ReturnType<typeof useEditorStore.getState>): CardEl | null => {
  for (const pg of PAGES) {
    const f = s.pages[pg].find((x) => x.id === s.selectedId);
    if (f) return f;
  }
  return null;
};

/* ------------------------------------------------------------------ */
/*  THƯƠNG HIỆU                                                         */
/* ------------------------------------------------------------------ */
export function BrandPanel() {
  const { colors, fonts, logos, addColor, removeColor, toggleFont, addLogo, removeLogo } = useBrandStore();
  const [pick, setPick] = useState('#2f6bff');
  const [busy, setBusy] = useState(false);
  const sel = useEditorStore(selectedEl);
  useEffect(() => { void useBrandStore.persist.rehydrate(); }, []);

  function applyColor(c: string) {
    const st = useEditorStore.getState();
    const el = selectedEl(st);
    if (el && el.kind !== 'image' && el.kind !== 'frame') { st.checkpoint(); st.patch(el.id, { color: c }); }
    else st.setBackdrop(c);                     // không chọn gì -> đổi nền trang đang chỉnh
  }
  function applyFont(f: string) {
    const st = useEditorStore.getState();
    const el = selectedEl(st);
    if (el?.kind === 'text') { st.checkpoint(); st.patch(el.id, { font: f }); }
    else st.addText({ font: f, text: f, size: 36 });
  }
  function grabFromCard() {
    const st = useEditorStore.getState();
    const seen = new Set<string>();
    for (const pg of PAGES) for (const e of st.pages[pg]) if (e.color && e.kind !== 'draw') seen.add(e.color);
    seen.forEach(addColor);
  }
  async function onLogo(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    for (const f of Array.from(files)) if (f.type.startsWith('image/')) addLogo(await readImage(f, 600));
    setBusy(false);
  }
  async function placeLogo(src: string) {
    const st = useEditorStore.getState();
    st.addImage(src, await imageRatio(src));
  }

  return (
    <>
      <p className={p.hint} style={{ marginTop: 0 }}>Lưu màu, phông chữ và logo của bạn để áp dụng nhanh cho mọi thiệp.</p>

      <h3 className={p.browse}>Màu thương hiệu</h3>
      <div className={p.brandColors}>
        {colors.map((c) => (
          <span key={c} className={p.brandSwatchWrap}>
            <button type="button" className={p.brandSwatch} style={{ background: c }} aria-label={`Áp dụng màu ${c}`} title={sel ? 'Đổi màu phần tử đang chọn' : 'Đổi màu nền trang'} onClick={() => applyColor(c)} />
            <button type="button" className={p.brandX} aria-label={`Xóa màu ${c}`} onClick={() => removeColor(c)}>×</button>
          </span>
        ))}
        {colors.length === 0 && <p className={p.empty}>Chưa có màu nào</p>}
      </div>
      <div className={p.brandAdd}>
        <input type="color" value={pick} onChange={(ev) => setPick(ev.target.value)} aria-label="Chọn màu" />
        <button type="button" className={p.ghost} onClick={() => addColor(pick)}>Thêm màu này</button>
      </div>
      <button type="button" className={p.ghost} style={{ width: '100%', marginTop: 8 }} onClick={grabFromCard}>Lấy màu từ thiệp hiện tại</button>

      <h3 className={p.browse} style={{ marginTop: 22 }}>Phông chữ thương hiệu</h3>
      <div className={p.stack}>
        {[...FONTS].sort((a, b) => Number(fonts.includes(b)) - Number(fonts.includes(a))).map((f) => {
          const on = fonts.includes(f);
          return (
            <div key={f} className={p.brandFont}>
              <button type="button" className={p.font} style={{ fontFamily: `'${f}'`, flex: 1 }} onClick={() => applyFont(f)}>{f}</button>
              <button type="button" className={p.star} aria-pressed={on} aria-label={on ? `Bỏ ${f} khỏi thương hiệu` : `Thêm ${f} vào thương hiệu`} onClick={() => toggleFont(f)}>{on ? '★' : '☆'}</button>
            </div>
          );
        })}
      </div>

      <h3 className={p.browse} style={{ marginTop: 22 }}>Logo</h3>
      <label className={p.upload} style={{ height: 80 }}>
        {busy ? 'Đang xử lý…' : 'Tải logo lên'}
        <input type="file" accept="image/*" multiple hidden onChange={(ev) => { void onLogo(ev.target.files); ev.target.value = ''; }} />
      </label>
      {logos.length > 0 && (
        <div className={p.grid}>
          {logos.map((src, i) => (
            <span key={i} className={p.brandSwatchWrap}>
              <button type="button" className={p.photo} style={{ backgroundImage: `url("${src}")`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundColor: '#f4f4f4', width: '100%' }} aria-label={`Thêm logo ${i + 1} lên thiệp`} onClick={() => void placeLogo(src)} />
              <button type="button" className={p.brandX} aria-label={`Xóa logo ${i + 1}`} onClick={() => removeLogo(i)}>×</button>
            </span>
          ))}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  CÔNG CỤ                                                             */
/* ------------------------------------------------------------------ */
const ALIGNS: { to: AlignTo; label: string; d: string[] }[] = [
  { to: 'left', label: 'Căn sát trái', d: ['M4 4v16', 'M8 7h12v4H8z', 'M8 13h7v4H8z'] },
  { to: 'hcenter', label: 'Căn giữa ngang', d: ['M12 3v18', 'M5 7h14v4H5z', 'M8 13h8v4H8z'] },
  { to: 'right', label: 'Căn sát phải', d: ['M20 4v16', 'M4 7h12v4H4z', 'M9 13h7v4H9z'] },
  { to: 'top', label: 'Căn sát trên', d: ['M4 4h16', 'M7 8v12h4V8z', 'M13 8v7h4V8z'] },
  { to: 'vmiddle', label: 'Căn giữa dọc', d: ['M3 12h18', 'M7 5v14h4V5z', 'M13 8v8h4V8z'] },
  { to: 'bottom', label: 'Căn sát dưới', d: ['M4 20h16', 'M7 4v12h4V4z', 'M13 9v7h4V9z'] },
];
const KIND_NAME: Record<CardEl['kind'], string> = { text: 'Chữ', sticker: 'Đồ họa', image: 'Ảnh', shape: 'Hình khối', threed: '3D', frame: 'Khung ảnh', draw: 'Nét vẽ' };

export function ToolsPanel() {
  const els = useEditorStore((s) => s.pages[s.page]);
  const selectedId = useEditorStore((s) => s.selectedId);
  const showSafe = useEditorStore((s) => s.showSafe);
  const { select, reorder, remove, alignEl, setShowSafe, clearPage } = useEditorStore.getState();
  const sel = els.find((e) => e.id === selectedId);

  function align(to: AlignTo) {
    if (!sel) return;
    const n = document.querySelector<HTMLElement>(`[data-id="${sel.id}"]`);
    alignEl(sel.id, to, sel.kind === 'text' ? n?.offsetHeight : undefined);
  }
  const label = (e: CardEl) => (e.kind === 'text' ? `“${(e.text ?? '').replace(/\s+/g, ' ').trim().slice(0, 22) || 'Chữ'}”` : KIND_NAME[e.kind]);

  return (
    <>
      <h3 className={p.browse}>Căn vào trang</h3>
      <div className={p.alignRow} role="group" aria-label="Căn phần tử vào trang">
        {ALIGNS.map((a) => (
          <button key={a.to} type="button" className={p.alignBtn} disabled={!sel} aria-label={a.label} title={a.label} onClick={() => align(a.to)}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{a.d.map((d) => <path key={d} d={d} />)}</svg>
          </button>
        ))}
      </div>
      {!sel && <p className={p.hint}>Chọn một phần tử trên thiệp để căn chỉnh.</p>}

      <h3 className={p.browse} style={{ marginTop: 22 }}>Hỗ trợ bố cục</h3>
      <label className={p.switchRow}>
        <input type="checkbox" checked={showSafe} onChange={(ev) => setShowSafe(ev.target.checked)} />
        Hiện lề an toàn và đường chia ba
      </label>
      <p className={p.hint}>Giữ chữ quan trọng trong vùng nét đứt để không bị cắt khi in.</p>

      <h3 className={p.browse} style={{ marginTop: 22 }}>Lớp ({els.length})</h3>
      {els.length === 0 ? <p className={p.empty}>Trang này chưa có phần tử</p> : (
        <ul className={p.layers}>
          {[...els].reverse().map((e, i) => (
            <li key={e.id} data-on={e.id === selectedId}>
              <button type="button" className={p.layerName} onClick={() => select(e.id)}>{label(e)}</button>
              <button type="button" className={p.layerBtn} aria-label="Đưa lên trên" disabled={i === 0} onClick={() => reorder(e.id, 1)}>↑</button>
              <button type="button" className={p.layerBtn} aria-label="Đưa xuống dưới" disabled={i === els.length - 1} onClick={() => reorder(e.id, -1)}>↓</button>
              <button type="button" className={p.layerBtn} aria-label="Xóa" onClick={() => remove(e.id)}>✕</button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className={p.ghost} style={{ width: '100%', marginTop: 14 }} disabled={!els.length}
        onClick={() => { if (window.confirm('Xóa toàn bộ phần tử trên trang đang chỉnh? Có thể Hoàn tác.')) clearPage(); }}>
        Xóa sạch trang này
      </button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  ỨNG DỤNG                                                            */
/* ------------------------------------------------------------------ */
const EMOJI = ['💍', '💐', '🎂', '🎉', '🎈', '🥂', '💌', '❤️', '✨', '🌸', '🕊️', '🎁', '🍾', '🌹', '👑', '📍'];

function QrApp() {
  const [text, setText] = useState('https://');
  const [color, setColor] = useState('#1a1a1a');
  const [err, setErr] = useState('');
  async function add() {
    const v = text.trim();
    if (!v || v === 'https://') { setErr('Nhập đường dẫn hoặc nội dung cần mã hóa.'); return; }
    try {
      const svg = await QRCode.toString(v, { type: 'svg', margin: 1, color: { dark: color, light: '#ffffff' } });
      setErr('');
      useEditorStore.getState().addImage(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, 1);
    } catch { setErr('Nội dung quá dài để tạo mã QR.'); }
  }
  return (
    <>
      <h3 className={p.browse}>Mã QR</h3>
      <input className={p.search} style={{ paddingLeft: 14, width: '100%' }} value={text} onChange={(ev) => setText(ev.target.value)} placeholder="Đường dẫn bản đồ, website, mừng cưới…" aria-label="Nội dung mã QR" />
      <p className={p.label}>Màu mã</p>
      <ColorGrid value={color} onPick={setColor} />
      {err && <p className={p.notice} role="alert">{err}</p>}
      <button type="button" className={p.primary} style={{ marginTop: 14 }} onClick={() => void add()}>Thêm mã QR vào thiệp</button>
      <p className={p.hint}>Mã QR được tạo ngay trên máy bạn và luôn nằm trong trang đang chỉnh.</p>
    </>
  );
}

export function AppsPanel() {
  return (
    <>
      <QrApp />
      <h3 className={p.browse} style={{ marginTop: 22 }}>Biểu tượng cảm xúc</h3>
      <div className={p.emojiGrid}>
        {EMOJI.map((em) => (
          <button key={em} type="button" className={p.emoji} aria-label={`Thêm ${em}`} onClick={() => useEditorStore.getState().addText({ text: em, size: 88, w: 160, font: 'Be Vietnam Pro' })}>{em}</button>
        ))}
      </div>
    </>
  );
}
