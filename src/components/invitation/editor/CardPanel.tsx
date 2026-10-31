// src/components/invitation/editor/CardPanel.tsx
// Sidebar chỉnh THIỆP, bố cục giống Canva: Mẫu · Phần tử · Chữ · Nền · Tải lên · Vẽ.
'use client';

import { useState, type ReactNode } from 'react';
import { CATEGORIES, TEMPLATES, type CategoryId } from '@/lib/templates';
import { InvitationPreview } from '@/components/templates/InvitationPreview';
import {
  ART_BY_CAT, ARTS, ArtSVG, BACKDROPS, FONTS, FRAMES, GRIDS,
  type Art, type ArtCat,
} from './editor.data';
import { FrameView } from './PageEditor';
import { ColorGrid } from './Toolbars';
import { readImage, imageRatio } from './readImage';
import { PAGES, useEditorStore, type PageId } from './useEditorStore';
import p from './CardPanel.module.css';

export type CardTab = 'templates' | 'elements' | 'text' | 'background' | 'uploads' | 'draw';

const PAGE_LABEL: Record<PageId, string> = { 
  cover: 'Mặt ngoài', 
  insideLeft: 'Trang trái', 
  inside: 'Trang phải', 
  back: 'Mặt sau' 
};

/* ------------------------------------------------------------------ */
function Search({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className={p.searchWrap}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
      <input className={p.search} type="search" value={value} placeholder={placeholder} aria-label={placeholder} onChange={(ev) => onChange(ev.target.value)} />
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className={p.section}>
      <header className={p.sectionHead}><h3>{title}</h3>{action}</header>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  MẪU                                                                 */
/* ------------------------------------------------------------------ */
function TemplatesPanel() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [note, setNote] = useState('');
  const current = useEditorStore((s) => s.tplName);
  const needle = q.trim().toLowerCase();
  const list = TEMPLATES.filter((t) => (!cat || t.category === cat) && (!needle || `${t.name} ${t.tagline}`.toLowerCase().includes(needle)));

  return (
    <>
      <Search value={q} onChange={setQ} placeholder="Tìm mẫu thiệp" />
      <div className={p.chipRow} role="group" aria-label="Loại thiệp">
        <button type="button" className={p.cat} aria-pressed={cat === null} onClick={() => setCat(null)}>Tất cả</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" className={p.cat} aria-pressed={cat === c.id} onClick={() => setCat(cat === c.id ? null : c.id)}>{c.label}</button>
        ))}
      </div>
      {note && <p className={p.notice} role="status">{note}</p>}
      <div className={p.tplGrid}>
        {list.map((t) => (
          <button key={t.slug} type="button" className={p.tpl} aria-pressed={current === t.name} title={t.name}
            onClick={() => { useEditorStore.getState().loadTemplate(t, true); setNote(`Đã áp dụng mẫu “${t.name}”. Nhấn Hoàn tác để quay lại thiệp trước.`); }}>
            <span className={p.tplThumb}><InvitationPreview template={t} variant="card" /></span>
            <span className={p.tplName}>{t.name}</span>
          </button>
        ))}
        {list.length === 0 && <p className={p.empty}>Không tìm thấy mẫu phù hợp</p>}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  PHẦN TỬ                                                             */
/* ------------------------------------------------------------------ */
type ElCat = ArtCat | 'frame' | 'grid';
const EL_CATS: { id: ElCat; label: string; tint: string; art: [string, string] }[] = [
  { id: 'shape', label: 'Hình khối', tint: 'linear-gradient(135deg,#7fe3e0,#3aa7c9)', art: ['pent', 'tri'] },
  { id: 'graphic', label: 'Đồ họa', tint: 'linear-gradient(135deg,#ffb36b,#ff6a3d)', art: ['flower', 'sparkle'] },
  { id: '3d', label: '3D', tint: 'linear-gradient(135deg,#9ec5ff,#6d5cff)', art: ['cube', 'sphere'] },
  { id: 'frame', label: 'Khung', tint: 'linear-gradient(135deg,#ffd1e8,#ff7ab8)', art: ['heart', 'circle'] },
  { id: 'grid', label: 'Lưới', tint: 'linear-gradient(135deg,#b7f0a8,#38b36a)', art: ['sq', 'rsq'] },
];

function ArtButton({ a }: { a: Art }) {
  const add = useEditorStore.getState().addShape;
  return (
    <button type="button" className={p.item} aria-label={a.name} title={a.name}
      onClick={() => add(a.cat === 'shape' ? 'shape' : a.cat === '3d' ? 'threed' : 'sticker', a.id, a.color, a.stroke)}>
      <ArtSVG id={a.id} color={a.color} />
    </button>
  );
}

function FrameGrid() {
  const addFrame = useEditorStore.getState().addFrame;
  return (
    <div className={p.grid}>
      {FRAMES.map((f) => (
        <button key={f.id} type="button" className={p.item} aria-label={`Khung ${f.name}`} title={f.name} onClick={() => addFrame(f.id, f.ratio)}>
          <span className={p.frameThumb} style={{ aspectRatio: String(f.ratio) }}>
            <FrameView el={{ id: 't', kind: 'frame', art: f.id, x: 0, y: 0, w: 0, h: 0, rot: 0 }} />
          </span>
        </button>
      ))}
    </div>
  );
}

function GridGrid() {
  const addGrid = useEditorStore.getState().addGrid;
  return (
    <div className={p.grid}>
      {GRIDS.map((g) => (
        <button key={g.id} type="button" className={p.item} aria-label={`Lưới ${g.name}`} title={g.name} onClick={() => addGrid(g.cells)}>
          <span className={p.gridThumb}>
            {g.cells.map(([x, y, w, h], i) => (
              <i key={i} style={{ left: `${x * 100 + (x > 0.001 ? 2 : 0)}%`, top: `${y * 100 + (y > 0.001 ? 2 : 0)}%`, width: `${w * 100 - (x > 0.001 ? 2 : 0) - (x + w < 0.999 ? 2 : 0)}%`, height: `${h * 100 - (y > 0.001 ? 2 : 0) - (y + h < 0.999 ? 2 : 0)}%` }} />
            ))}
          </span>
        </button>
      ))}
    </div>
  );
}

function ElementsPanel() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<ElCat | null>(null);
  const needle = q.trim().toLowerCase();
  const found = needle ? ARTS.filter((a) => a.name.toLowerCase().includes(needle)) : [];
  const cur = EL_CATS.find((c) => c.id === cat);

  return (
    <>
      <Search value={q} onChange={(v) => { setQ(v); if (v) setCat(null); }} placeholder="Tìm phần tử" />
      {needle ? (
        found.length ? <div className={p.grid}>{found.map((a) => <ArtButton key={a.id} a={a} />)}</div> : <p className={p.empty}>Không tìm thấy phần tử</p>
      ) : cur ? (
        <>
          <button type="button" className={p.back} onClick={() => setCat(null)}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
            {cur.label}
          </button>
          {cur.id === 'frame' ? <FrameGrid /> : cur.id === 'grid' ? <GridGrid /> : <div className={p.grid}>{ART_BY_CAT[cur.id].map((a) => <ArtButton key={a.id} a={a} />)}</div>}
        </>
      ) : (
        <>
          <h3 className={p.browse}>Danh mục</h3>
          <div className={p.tiles}>
            {EL_CATS.map((c) => (
              <button key={c.id} type="button" className={p.tile} onClick={() => setCat(c.id)}>
                <span className={p.tileArt} style={{ background: c.tint }}>
                  <span className={p.tileA}><ArtSVG id={c.art[0]} color="#fff" /></span>
                  <span className={p.tileB}><ArtSVG id={c.art[1]} color="rgba(255,255,255,.7)" /></span>
                </span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
          <Section title="Hình khối" action={<button type="button" className={p.more} onClick={() => setCat('shape')}>Xem tất cả</button>}>
            <div className={p.row}>{ART_BY_CAT.shape.slice(0, 6).map((a) => <ArtButton key={a.id} a={a} />)}</div>
          </Section>
          <Section title="3D" action={<button type="button" className={p.more} onClick={() => setCat('3d')}>Xem tất cả</button>}>
            <div className={p.row}>{ART_BY_CAT['3d'].slice(0, 6).map((a) => <ArtButton key={a.id} a={a} />)}</div>
          </Section>
        </>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  CHỮ                                                                 */
/* ------------------------------------------------------------------ */
const TEXT_PRESETS = [
  { label: 'Thêm tiêu đề', size: 64, bold: true, font: 'Playfair Display', text: 'Tiêu đề' },
  { label: 'Thêm tiêu đề phụ', size: 36, bold: true, font: 'Be Vietnam Pro', text: 'Tiêu đề phụ' },
  { label: 'Thêm nội dung', size: 22, bold: false, font: 'Be Vietnam Pro', text: 'Nội dung văn bản' },
];
const PAIRS: { name: string; a: [string, number]; b: [string, number]; ta: string; tb: string }[] = [
  { name: 'Cổ điển', a: ['Playfair Display', 54], b: ['Be Vietnam Pro', 20], ta: 'Lễ thành hôn', tb: 'Trân trọng kính mời' },
  { name: 'Lãng mạn', a: ['Dancing Script', 60], b: ['Montserrat', 18], ta: 'Love Story', tb: 'CHÚNG TÔI SẼ CƯỚI' },
  { name: 'Tiệc tùng', a: ['Pacifico', 52], b: ['Oswald', 24], ta: 'Sinh nhật vui vẻ', tb: 'CÙNG ĐẾN VUI NHÉ' },
];

function TextPanel() {
  const { addText } = useEditorStore.getState();
  const [q, setQ] = useState('');
  const fonts = FONTS.filter((f) => f.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <Search value={q} onChange={setQ} placeholder="Tìm phông chữ" />
      <button type="button" className={p.primary} onClick={() => addText()}>Thêm hộp văn bản</button>
      <div className={p.stack}>
        {TEXT_PRESETS.map((t) => (
          <button key={t.label} type="button" className={p.preset} style={{ fontFamily: `'${t.font}'`, fontWeight: t.bold ? 700 : 400, fontSize: Math.min(t.size, 30) }}
            onClick={() => addText({ text: t.text, size: t.size, bold: t.bold, font: t.font })}>
            {t.label}
          </button>
        ))}
      </div>
      <Section title="Kết hợp phông chữ">
        <div className={p.stack}>
          {PAIRS.map((c) => (
            <button key={c.name} type="button" className={p.pair} title={c.name}
              onClick={() => {
                addText({ text: c.ta, font: c.a[0], size: c.a[1], bold: true, y: 250 });
                addText({ text: c.tb, font: c.b[0], size: c.b[1], bold: false, y: 250 + c.a[1] * 1.6 });
              }}>
              <span style={{ fontFamily: `'${c.a[0]}'`, fontSize: 26, fontWeight: 700 }}>{c.ta}</span>
              <span style={{ fontFamily: `'${c.b[0]}'`, fontSize: 13 }}>{c.tb}</span>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Phông chữ">
        <div className={p.stack}>
          {fonts.map((f) => (
            <button key={f} type="button" className={p.font} style={{ fontFamily: `'${f}'` }} onClick={() => addText({ font: f, text: f, size: 36 })}>{f}</button>
          ))}
          {fonts.length === 0 && <p className={p.empty}>Không có phông chữ phù hợp</p>}
        </div>
      </Section>
      <p className={p.hint}>Nhấn đúp vào chữ trên thiệp để sửa nội dung.</p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  NỀN                                                                 */
/* ------------------------------------------------------------------ */
function BackgroundPanel() {
  const bg = useEditorStore((s) => s.backdrops[s.page]);
  const { setBackdrop, checkpoint } = useEditorStore.getState();
  return (
    <>
      <h3 className={p.browse}>Màu nền</h3>
      <div className={p.grid}>
        {BACKDROPS.map((b) => (
          <button key={b} type="button" className={p.swatch} style={{ background: b }} aria-label={b} aria-pressed={bg === b} onClick={() => setBackdrop(b)} />
        ))}
        <label className={p.custom}>
          Màu tùy chọn
          <input type="color" onFocus={() => checkpoint()} onChange={(ev) => setBackdrop(ev.target.value, false)} />
        </label>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  TẢI LÊN                                                             */
/* ------------------------------------------------------------------ */
function UploadsPanel() {
  const uploads = useEditorStore((s) => s.uploads);
  const selFrame = useEditorStore((s) => {
    for (const pg of PAGES) {
      const f = s.pages[pg].find((x) => x.id === s.selectedId);
      if (f?.kind === 'frame') return f.id;
    }
    return null;
  });
  const [busy, setBusy] = useState(false);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image/')) continue;
      useEditorStore.getState().addUpload(await readImage(f));
    }
    setBusy(false);
  }
  async function use(src: string) {
    const st = useEditorStore.getState();
    if (selFrame) st.setFrameImage(selFrame, src);
    else st.addImage(src, await imageRatio(src));
  }

  return (
    <>
      <label className={p.upload}>
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 18a5 5 0 0 1-.6-9.96A6 6 0 0 1 18 9a4 4 0 0 1 0 8" /><path d="M12 12v8M9 15l3-3 3 3" /></svg>
        {busy ? 'Đang xử lý…' : 'Tải ảnh lên'}
        <input type="file" accept="image/*" multiple hidden onChange={(ev) => { void onFiles(ev.target.files); ev.target.value = ''; }} />
      </label>
      <p className={p.hint}>{selFrame ? 'Chọn một ảnh bên dưới để đưa vào khung đang chọn.' : 'Nhấn vào ảnh để thêm lên thiệp. Chọn một khung ảnh trước để đưa ảnh vào khung.'}</p>
      {uploads.length > 0 && (
        <div className={p.grid}>
          {uploads.map((src, i) => (
            <button key={i} type="button" className={p.photo} aria-label={`Ảnh đã tải ${i + 1}`} style={{ backgroundImage: `url("${src}")` }} onClick={() => void use(src)} />
          ))}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  VẼ                                                                  */
/* ------------------------------------------------------------------ */
function DrawPanel() {
  const cfg = useEditorStore((s) => s.draw);
  const strokes = useEditorStore((s) => s.pages[s.page].filter((e) => e.kind === 'draw').length);
  const { setDraw, clearStrokes } = useEditorStore.getState();
  return (
    <>
      <h3 className={p.browse}>Công cụ vẽ</h3>
      <div className={p.seg2} role="group" aria-label="Loại bút">
        <button type="button" aria-pressed={cfg.tool === 'pen'} onClick={() => setDraw({ tool: 'pen' })}>Bút</button>
        <button type="button" aria-pressed={cfg.tool === 'marker'} onClick={() => setDraw({ tool: 'marker' })}>Bút dạ quang</button>
      </div>
      <p className={p.label}>Độ dày nét: {cfg.size}px</p>
      <input className={p.slider} type="range" min={2} max={32} value={cfg.size} onChange={(ev) => setDraw({ size: Number(ev.target.value) })} aria-label="Độ dày nét" />
      <span className={p.preview} aria-hidden>
        <i style={{ background: cfg.color, height: cfg.tool === 'marker' ? cfg.size * 2.4 : cfg.size, opacity: cfg.tool === 'marker' ? 0.45 : 1 }} />
      </span>
      <p className={p.label}>Màu nét</p>
      <ColorGrid value={cfg.color} onPick={(c) => setDraw({ color: c })} />
      <div className={p.stack} style={{ marginTop: 18 }}>
        <button type="button" className={p.ghost} disabled={!strokes} onClick={() => clearStrokes(true)}>Xóa nét vừa vẽ</button>
        <button type="button" className={p.ghost} disabled={!strokes} onClick={() => clearStrokes(false)}>Xóa tất cả nét vẽ ({strokes})</button>
      </div>
      <p className={p.hint}>Kéo chuột (hoặc ngón tay) trên thiệp để vẽ. Mỗi nét vẽ là một phần tử: sang tab khác để chọn, di chuyển, đổi cỡ hoặc xóa.</p>
    </>
  );
}

/* ------------------------------------------------------------------ */
export function CardPanel({ tab, onPage }: { tab: CardTab; onPage?: (v: PageId) => void }) {
  const page = useEditorStore((s) => s.page);
  return (
    <div>
      {onPage && (
        <div className={p.pages} role="tablist" aria-label="Mặt thiệp đang chỉnh">
          {PAGES.map((pg) => (
            <button key={pg} type="button" role="tab" aria-selected={page === pg} onClick={() => onPage(pg)}>{PAGE_LABEL[pg]}</button>
          ))}
        </div>
      )}
      {tab === 'templates' && <TemplatesPanel />}
      {tab === 'elements' && <ElementsPanel />}
      {tab === 'text' && <TextPanel />}
      {tab === 'background' && <BackgroundPanel />}
      {tab === 'uploads' && <UploadsPanel />}
      {tab === 'draw' && <DrawPanel />}
    </div>
  );
}
