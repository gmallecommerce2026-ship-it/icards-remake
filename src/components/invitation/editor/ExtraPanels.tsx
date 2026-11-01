// src/components/invitation/editor/ExtraPanels.tsx
// Các tab bổ sung kiểu Canva: Thương hiệu · Công cụ · Ứng dụng.
'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import QRCode from 'qrcode';
import { PAGE } from '../envelope/envelope.data';
import { FONTS } from './editor.data';
import { ColorGrid } from './Toolbars';
import { readImage, imageRatio } from './readImage';
import { fitInside } from './bounds';
import { extractPalette } from './palette';
import { useBanks } from './banks';
import { bankQrArt, buildVietQR, cleanAccount, cleanMessage, stripDiacritics, validateBankQr, MESSAGE_MAX } from './vietqr';
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
type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };

export function BrandPanel() {
  const { colors, fonts, logos, addColor, removeColor, toggleFont, addLogo, removeLogo } = useBrandStore();
  const [pick, setPick] = useState('#2f6bff');
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<string | null>(null);     // màu vừa chọn: dùng cho các nút "áp dụng cho toàn thiệp"
  const [suggest, setSuggest] = useState<string[]>([]);          // màu gợi ý trích từ logo vừa tải
  const [note, setNote] = useState('');
  // EyeDropper API: chỉ có trên Chrome/Edge/Opera; server luôn trả false nên không lệch hydration
  const canEyedrop = useSyncExternalStore(() => () => {}, () => 'EyeDropper' in window, () => false);
  const sel = useEditorStore(selectedEl);
  useEffect(() => { void useBrandStore.persist.rehydrate(); }, []);

  const heading = fonts[0], body = fonts[1] ?? fonts[0];
  const color = active ?? colors[0];

  function applyColor(c: string) {
    setActive(c);
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
    setNote(seen.size ? `Đã lưu ${seen.size} màu từ thiệp.` : 'Thiệp chưa có màu nào để lấy.');
  }
  async function eyedrop() {
    try {
      const Ctor = (window as unknown as { EyeDropper: EyeDropperCtor }).EyeDropper;
      const { sRGBHex } = await new Ctor().open();
      addColor(sRGBHex);
      setActive(sRGBHex);
    } catch { /* người dùng nhấn Esc */ }
  }
  async function onLogo(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    let last = '';
    for (const f of Array.from(files)) if (f.type.startsWith('image/')) { last = await readImage(f, 400); addLogo(last); }
    if (last) setSuggest(await extractPalette(last));
    setBusy(false);
  }
  async function placeLogo(src: string) {
    const st = useEditorStore.getState();
    st.addImage(src, await imageRatio(src));
  }
  function textToBrandColor() {
    if (!color) return;
    useEditorStore.getState().recolorText(color);
    setNote(`Đã đổi màu mọi chữ trên thiệp. Nhấn Hoàn tác nếu chưa ưng.`);
  }
  function backgroundToBrandColor() {
    if (!color) return;
    useEditorStore.getState().setAllBackdrops(color);
    setNote('Đã đổi nền cả 4 mặt thiệp.');
  }
  function fontsToBrand() {
    if (!heading) return;
    useEditorStore.getState().applyFonts(heading, body);
    setNote(`Chữ lớn dùng “${heading}”, chữ còn lại dùng “${body}”.`);
  }

  return (
    <>
      <p className={p.hint} style={{ marginTop: 0 }}>Lưu màu, phông chữ và logo của bạn, rồi áp dụng cho cả thiệp chỉ với một lần nhấn.</p>
      {note && <p className={p.notice} role="status">{note}</p>}

      <h3 className={p.browse}>Màu thương hiệu</h3>
      <div className={p.brandColors}>
        {colors.map((c) => (
          <span key={c} className={p.brandSwatchWrap}>
            <button type="button" className={p.brandSwatch} data-on={c === color} style={{ background: c }} aria-label={`Áp dụng màu ${c}`} title={sel ? 'Đổi màu phần tử đang chọn' : 'Đổi màu nền trang'} onClick={() => applyColor(c)} />
            <button type="button" className={p.brandX} aria-label={`Xóa màu ${c}`} onClick={() => removeColor(c)}>×</button>
          </span>
        ))}
        {colors.length === 0 && <p className={p.empty}>Chưa có màu nào</p>}
      </div>
      <div className={p.brandAdd}>
        <input type="color" value={pick} onChange={(ev) => setPick(ev.target.value)} aria-label="Chọn màu" />
        <button type="button" className={p.ghost} onClick={() => addColor(pick)}>Thêm màu này</button>
        {canEyedrop && <button type="button" className={p.ghost} style={{ flex: '0 0 auto', padding: '0 12px' }} onClick={() => void eyedrop()} title="Hút màu từ bất kỳ đâu trên màn hình">Hút màu</button>}
      </div>
      <button type="button" className={p.ghost} style={{ width: '100%', marginTop: 8 }} onClick={grabFromCard}>Lấy màu từ thiệp hiện tại</button>

      {colors.length > 0 && (
        <>
          <h3 className={p.browse} style={{ marginTop: 22 }}>Áp dụng cho toàn thiệp</h3>
          <div className={p.stack}>
            <button type="button" className={p.ghost} disabled={!color} onClick={textToBrandColor}>
              Đổi màu mọi chữ{color ? ' sang ' : ''}{color && <i className={p.dot} style={{ background: color }} />}
            </button>
            <button type="button" className={p.ghost} disabled={!color} onClick={backgroundToBrandColor}>
              Dùng làm màu nền cả 4 mặt{color && <i className={p.dot} style={{ background: color }} />}
            </button>
          </div>
          <p className={p.hint}>Nhấn một màu ở trên để chọn màu dùng cho hai nút này (mặc định là màu đầu tiên).</p>
        </>
      )}

      <h3 className={p.browse} style={{ marginTop: 22 }}>Phông chữ thương hiệu</h3>
      <button type="button" className={p.ghost} style={{ width: '100%', marginBottom: 10 }} disabled={!heading} onClick={fontsToBrand}>
        Áp dụng phông cho toàn thiệp
      </button>
      <p className={p.hint} style={{ marginTop: 0 }}>Đánh dấu ★ tối đa 6 phông. Phông đầu tiên là <b>tiêu đề</b>, phông thứ hai là <b>nội dung</b>.</p>
      <div className={p.stack}>
        {[...FONTS].sort((a, b) => {
          const ia = fonts.indexOf(a), ib = fonts.indexOf(b);
          return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
        }).map((f) => {
          const on = fonts.includes(f);
          const role = fonts[0] === f ? 'Tiêu đề' : fonts[1] === f ? 'Nội dung' : '';
          return (
            <div key={f} className={p.brandFont}>
              <button type="button" className={p.font} style={{ fontFamily: `'${f}'`, flex: 1 }} onClick={() => applyFont(f)}>
                {f}{role && <small className={p.role}>{role}</small>}
              </button>
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
      {suggest.length > 0 && (
        <>
          <p className={p.label}>Màu trích từ logo</p>
          <div className={p.brandColors}>
            {suggest.map((c) => <button key={c} type="button" className={p.brandSwatch} style={{ background: c }} aria-label={`Thêm màu ${c} vào thương hiệu`} title="Thêm vào màu thương hiệu" onClick={() => { addColor(c); setSuggest((s) => s.filter((x) => x !== c)); }} />)}
          </div>
          <button type="button" className={p.ghost} style={{ width: '100%' }} onClick={() => { suggest.forEach(addColor); setSuggest([]); }}>Thêm tất cả vào thương hiệu</button>
        </>
      )}
      {logos.length > 0 && (
        <div className={p.grid} style={{ marginTop: 12 }}>
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
const FLIPPABLE: CardEl['kind'][] = ['image', 'sticker', 'shape', 'threed', 'frame'];

/** Ô số: gõ xong nhấn Enter hoặc rời ô mới áp dụng (mỗi lần chỉ tạo một mốc Hoàn tác). */
function Num({ label, value, min, max, disabled, onCommit }: { label: string; value: number; min?: number; max?: number; disabled?: boolean; onCommit: (v: number) => void }) {
  const shown = String(Math.round(value * 10) / 10);
  const done = (el: HTMLInputElement) => {
    let v = Number(el.value);
    if (!Number.isFinite(v)) { el.value = shown; return; }
    if (min !== undefined) v = Math.max(min, v);
    if (max !== undefined) v = Math.min(max, v);
    if (v !== Number(shown)) onCommit(v);
    else el.value = shown;
  };
  return (
    <label className={p.num}>
      <span>{label}</span>
      <input key={shown} type="number" inputMode="decimal" defaultValue={shown} disabled={disabled} aria-label={label}
        onBlur={(ev) => done(ev.currentTarget)} onKeyDown={(ev) => { if (ev.key === 'Enter') ev.currentTarget.blur(); }} />
    </label>
  );
}

const domEl = (id: string) => document.querySelector<HTMLElement>(`[data-id="${id}"]`);

export function ToolsPanel() {
  const els = useEditorStore((s) => s.pages[s.page]);
  const selectedId = useEditorStore((s) => s.selectedId);
  const showSafe = useEditorStore((s) => s.showSafe);
  const { select, reorder, remove, alignEl, setShowSafe, clearPage } = useEditorStore.getState();
  const sel = els.find((e) => e.id === selectedId);
  const [lock, setLock] = useState(true);       // khoá tỉ lệ khi đổi rộng / cao
  const [step, setStep] = useState(1);
  const [note, setNote] = useState('');
  const armed = useRef(false);

  function align(to: AlignTo) {
    if (!sel) return;
    alignEl(sel.id, to, sel.kind === 'text' ? domEl(sel.id)?.offsetHeight : undefined);
  }
  // Đổi thông số phần tử đang chọn rồi kéo nó trở lại nằm trọn trong trang (giống khi kéo thả)
  function change(patch: Partial<CardEl>, record = true) {
    if (!sel) return;
    const hText = sel.kind === 'text' ? domEl(sel.id)?.offsetHeight : undefined;
    const fix = fitInside({ ...sel, ...patch }, hText);
    const st = useEditorStore.getState();
    if (record) st.checkpoint();
    st.patch(sel.id, { ...patch, ...fix });
  }
  const textH = sel?.kind === 'text' ? (domEl(sel.id)?.offsetHeight ?? sel.h) : sel?.h ?? 0;
  function setW(w: number) {
    if (!sel) return;
    if (sel.kind === 'text' || !lock) change({ w });
    else change({ w, h: (w * sel.h) / sel.w });
  }
  function setH(h: number) {
    if (!sel || sel.kind === 'text') return;
    if (lock) change({ h, w: (h * sel.w) / sel.h });
    else change({ h });
  }
  function nudge(dx: number, dy: number) {
    if (sel) change({ x: sel.x + dx * step, y: sel.y + dy * step });
  }
  function spread() {
    const hs: Record<string, number> = {};
    for (const e of els) if (e.kind === 'text') hs[e.id] = domEl(e.id)?.offsetHeight ?? e.h;
    const before = useEditorStore.getState().pages[useEditorStore.getState().page];
    useEditorStore.getState().distribute(hs);
    const after = useEditorStore.getState().pages[useEditorStore.getState().page];
    setNote(before === after ? 'Các phần tử đang quá sát nhau, chưa thể chia đều. Hãy kéo giãn phần tử trên cùng và dưới cùng ra xa hơn.' : 'Đã chia đều khoảng cách dọc.');
  }
  const label = (e: CardEl) => (e.kind === 'text' ? `“${(e.text ?? '').replace(/\s+/g, ' ').trim().slice(0, 22) || 'Chữ'}”` : KIND_NAME[e.kind]);
  const arrow = (d: string) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;

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
      {!sel && <p className={p.hint}>Chọn một phần tử trên thiệp để dùng các công cụ bên dưới.</p>}

      {sel && (
        <>
          <h3 className={p.browse} style={{ marginTop: 22 }}>Vị trí và kích thước · {KIND_NAME[sel.kind]}</h3>
          <div className={p.numGrid}>
            <Num label="X" value={sel.x} onCommit={(x) => change({ x })} />
            <Num label="Y" value={sel.y} onCommit={(y) => change({ y })} />
            <Num label="Rộng" value={sel.w} min={8} max={PAGE.w} onCommit={setW} />
            <Num label="Cao" value={textH} min={8} max={PAGE.h} disabled={sel.kind === 'text'} onCommit={setH} />
            <Num label="Xoay °" value={sel.rot} min={-360} max={360} onCommit={(rot) => change({ rot })} />
          </div>
          <label className={p.switchRow} style={{ marginTop: 8 }}>
            <input type="checkbox" checked={lock} onChange={(ev) => setLock(ev.target.checked)} disabled={sel.kind === 'text'} />
            Giữ nguyên tỉ lệ khi đổi kích thước
          </label>

          {sel.kind !== 'draw' && (
            <>
              <p className={p.label}>Độ trong suốt: {Math.round((sel.op ?? 1) * 100)}%</p>
              <input className={p.slider} type="range" min={5} max={100} value={Math.round((sel.op ?? 1) * 100)} aria-label="Độ trong suốt"
                onChange={(ev) => { if (!armed.current) { useEditorStore.getState().checkpoint(); armed.current = true; } useEditorStore.getState().patch(sel.id, { op: Number(ev.target.value) / 100 }); }}
                onPointerUp={() => { armed.current = false; }} onKeyUp={() => { armed.current = false; }} onBlur={() => { armed.current = false; }} />
            </>
          )}

          <h3 className={p.browse} style={{ marginTop: 18 }}>Dịch chuyển chính xác</h3>
          <div className={p.nudge}>
            <span />
            <button type="button" className={p.alignBtn} aria-label="Lên" onClick={() => nudge(0, -1)}>{arrow('M12 19V5M6 11l6-6 6 6')}</button>
            <span />
            <button type="button" className={p.alignBtn} aria-label="Sang trái" onClick={() => nudge(-1, 0)}>{arrow('M19 12H5M11 6l-6 6 6 6')}</button>
            <button type="button" className={p.alignBtn} aria-label="Xuống" onClick={() => nudge(0, 1)}>{arrow('M12 5v14M6 13l6 6 6-6')}</button>
            <button type="button" className={p.alignBtn} aria-label="Sang phải" onClick={() => nudge(1, 0)}>{arrow('M5 12h14M13 6l6 6-6 6')}</button>
          </div>
          <div className={p.seg2} role="group" aria-label="Bước dịch chuyển" style={{ marginTop: 8 }}>
            <button type="button" aria-pressed={step === 1} onClick={() => setStep(1)}>1 px</button>
            <button type="button" aria-pressed={step === 10} onClick={() => setStep(10)}>10 px</button>
          </div>

          <h3 className={p.browse} style={{ marginTop: 18 }}>Thao tác nhanh</h3>
          <div className={p.quad}>
            <button type="button" className={p.ghost} onClick={() => useEditorStore.getState().duplicate(sel.id)}>Nhân đôi</button>
            <button type="button" className={p.ghost} onClick={() => remove(sel.id)}>Xóa</button>
            <button type="button" className={p.ghost} disabled={!FLIPPABLE.includes(sel.kind)} onClick={() => { useEditorStore.getState().checkpoint(); useEditorStore.getState().patch(sel.id, { flipX: !sel.flipX }); }}>Lật ngang</button>
            <button type="button" className={p.ghost} disabled={!FLIPPABLE.includes(sel.kind)} onClick={() => { useEditorStore.getState().checkpoint(); useEditorStore.getState().patch(sel.id, { flipY: !sel.flipY }); }}>Lật dọc</button>
          </div>
        </>
      )}

      <h3 className={p.browse} style={{ marginTop: 22 }}>Hỗ trợ bố cục</h3>
      <label className={p.switchRow}>
        <input type="checkbox" checked={showSafe} onChange={(ev) => setShowSafe(ev.target.checked)} />
        Hiện lề an toàn và đường chia ba
      </label>
      <p className={p.hint}>Giữ chữ quan trọng trong vùng nét đứt để không bị cắt khi in.</p>
      <button type="button" className={p.ghost} style={{ width: '100%' }} disabled={els.filter((e) => e.kind !== 'draw').length < 3} onClick={spread}>Chia đều khoảng cách dọc</button>
      {note && <p className={p.notice} role="status" style={{ marginTop: 10 }}>{note}</p>}

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
const DARK_QR = ['#1a1a1a', '#0b3d91', '#1b5e20', '#7a1f1f', '#4a148c', '#3e2723'];   // chỉ màu tối: QR cần độ tương phản cao để quét được

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className={p.field}>
      <span className={p.label}>{label}</span>
      {children}
      {hint && <small className={p.fieldHint}>{hint}</small>}
    </label>
  );
}

/** QR cho liên kết / văn bản bất kỳ */
function LinkQr() {
  const [text, setText] = useState('https://');
  const [color, setColor] = useState('#1a1a1a');
  const [err, setErr] = useState('');
  async function add() {
    const v = text.trim();
    if (!v || v === 'https://') { setErr('Nhập đường dẫn hoặc nội dung cần mã hóa.'); return; }
    try {
      const svg = await QRCode.toString(v, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: color, light: '#ffffff' } });
      setErr('');
      useEditorStore.getState().addImage(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, 1);
    } catch { setErr('Nội dung quá dài để tạo mã QR.'); }
  }
  return (
    <>
      <input className={p.search} style={{ paddingLeft: 14, width: '100%' }} value={text} onChange={(ev) => setText(ev.target.value)} placeholder="Đường dẫn bản đồ, website, mừng cưới…" aria-label="Nội dung mã QR" />
      <p className={p.label}>Màu mã</p>
      <ColorGrid value={color} onPick={setColor} />
      {err && <p className={p.notice} role="alert">{err}</p>}
      <button type="button" className={p.primary} style={{ marginTop: 14 }} onClick={() => void add()}>Thêm mã QR vào thiệp</button>
      <p className={p.hint}>Mã QR được tạo ngay trên máy bạn và luôn nằm trong trang đang chỉnh.</p>
    </>
  );
}

const BANK_KEY = 'icards:qrbank';
type BankForm = { bin: string; account: string; holder: string; amount: string; message: string; caption: boolean; color: string };
const BANK_DEFAULT: BankForm = { bin: '', account: '', holder: '', amount: '', message: '', caption: true, color: '#1a1a1a' };

/** QR chuyển khoản ngân hàng chuẩn VietQR (quét được bằng mọi app ngân hàng và ví hỗ trợ VietQR) */
function BankQr() {
  const { banks, live } = useBanks();
  const [f, setF] = useState<BankForm>(BANK_DEFAULT);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const loaded = useRef(false);

  // nhớ thông tin lần trước để làm thiệp tiếp theo không phải nhập lại (chỉ lưu trên máy này)
  useEffect(() => {
    let saved: Partial<BankForm> | null = null;
    try { const raw = localStorage.getItem(BANK_KEY); if (raw) saved = JSON.parse(raw) as Partial<BankForm>; } catch { /* bỏ qua */ }
    queueMicrotask(() => {                       // cập nhật trong callback, không gọi setState đồng bộ trong thân effect
      if (saved) setF((cur) => ({ ...cur, ...saved, amount: '', message: '' }));
      loaded.current = true;
    });
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(BANK_KEY, JSON.stringify({ bin: f.bin, account: f.account, holder: f.holder, caption: f.caption, color: f.color })); } catch { /* bỏ qua */ }
  }, [f.bin, f.account, f.holder, f.caption, f.color]);

  const set = <K extends keyof BankForm>(k: K, v: BankForm[K]) => { setF((s) => ({ ...s, [k]: v })); setErr(''); setOk(''); };
  const needle = stripDiacritics(q).toLowerCase().trim();
  const list = useMemo(() => banks.filter((b) => !needle || stripDiacritics(`${b.shortName} ${b.name}`).toLowerCase().includes(needle)), [banks, needle]);
  const bank = banks.find((b) => b.bin === f.bin);
  const amount = f.amount ? Number(f.amount.replace(/\D/g, '')) : undefined;

  async function add() {
    const input = { bin: f.bin, account: cleanAccount(f.account), amount, message: f.message };
    const bad = validateBankQr(input);
    if (bad) { setErr(bad); return; }
    if (f.caption && !f.holder.trim()) { setErr('Nhập tên chủ tài khoản, hoặc tắt mục hiển thị thông tin dưới mã.'); return; }
    const art = bankQrArt({
      payload: buildVietQR(input),
      dark: f.color,
      caption: f.caption && bank ? { bank: bank.shortName, holder: stripDiacritics(f.holder).toUpperCase().trim(), account: input.account } : undefined,
    });
    useEditorStore.getState().addImage(art.src, art.ratio);
    setErr('');
    setOk('Đã thêm mã. Hãy quét thử bằng app ngân hàng trước khi in hoặc gửi thiệp.');
  }

  return (
    <>
      <Field label="Ngân hàng thụ hưởng" hint={live ? undefined : 'Đang dùng danh sách có sẵn trong máy.'}>
        <input className={p.search} style={{ paddingLeft: 14, width: '100%', height: 40 }} type="search" value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="Tìm ngân hàng: vcb, tech, mb…" aria-label="Tìm ngân hàng" />
        <select className={p.select} size={4} value={f.bin} onChange={(ev) => set('bin', ev.target.value)} aria-label="Ngân hàng">
          {list.map((b) => <option key={b.bin} value={b.bin}>{b.shortName} · {b.name}</option>)}
        </select>
        {list.length === 0 && <small className={p.fieldHint}>Không có ngân hàng phù hợp.</small>}
      </Field>

      <Field label="Số tài khoản">
        <input className={p.input} inputMode="numeric" autoComplete="off" maxLength={24} value={f.account} onChange={(ev) => set('account', cleanAccount(ev.target.value))} placeholder="Chỉ nhập số" />
      </Field>
      <Field label="Tên chủ tài khoản">
        <input className={p.input} autoComplete="off" maxLength={40} value={f.holder} onChange={(ev) => set('holder', ev.target.value)} placeholder="NGUYEN VAN A" />
      </Field>
      <Field label="Số tiền (không bắt buộc)" hint="Để trống nếu muốn khách tự nhập số tiền mừng.">
        <input className={p.input} inputMode="numeric" value={f.amount ? Number(f.amount.replace(/\D/g, '')).toLocaleString('vi-VN') : ''} onChange={(ev) => set('amount', ev.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="VD: 500.000" />
      </Field>
      <Field label={`Nội dung chuyển khoản (${f.message.length}/${MESSAGE_MAX})`} hint="Không dấu, tối đa 25 ký tự. Một số ngân hàng bỏ qua ô này.">
        <input className={p.input} autoComplete="off" maxLength={MESSAGE_MAX} value={f.message} onChange={(ev) => set('message', cleanMessage(ev.target.value + (ev.target.value.endsWith(' ') ? ' ' : '')))} placeholder="Mung cuoi A va B" />
      </Field>

      <label className={p.switchRow} style={{ marginTop: 4 }}>
        <input type="checkbox" checked={f.caption} onChange={(ev) => set('caption', ev.target.checked)} />
        Ghi tên ngân hàng, chủ tài khoản và số tài khoản dưới mã
      </label>
      <p className={p.label}>Màu mã (chỉ màu tối để dễ quét)</p>
      <div className={p.brandColors}>
        {DARK_QR.map((c) => <button key={c} type="button" className={p.brandSwatch} data-on={f.color === c} style={{ background: c }} aria-label={c} onClick={() => set('color', c)} />)}
      </div>

      {err && <p className={p.notice} role="alert" style={{ background: '#fdecec', color: '#8a1c1c' }}>{err}</p>}
      {ok && <p className={p.notice} role="status">{ok}</p>}
      <button type="button" className={p.primary} onClick={() => void add()}>Thêm QR ngân hàng vào thiệp</button>
      <p className={p.hint}>Mã theo chuẩn VietQR (NAPAS 247), tạo hoàn toàn trên máy bạn: số tài khoản không được gửi đi đâu. Thông tin chỉ được nhớ trên trình duyệt này để dùng lại cho thiệp sau.</p>
    </>
  );
}

function QrApp() {
  const [mode, setMode] = useState<'link' | 'bank'>('link');
  return (
    <>
      <h3 className={p.browse}>Mã QR</h3>
      <div className={p.seg2} role="group" aria-label="Loại mã QR" style={{ marginBottom: 14 }}>
        <button type="button" aria-pressed={mode === 'link'} onClick={() => setMode('link')}>Liên kết</button>
        <button type="button" aria-pressed={mode === 'bank'} onClick={() => setMode('bank')}>Ngân hàng</button>
      </div>
      {mode === 'link' ? <LinkQr /> : <BankQr />}
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
