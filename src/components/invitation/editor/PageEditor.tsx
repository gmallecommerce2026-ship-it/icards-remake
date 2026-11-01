// src/components/invitation/editor/PageEditor.tsx
'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type RefObject } from 'react';
import { PAGE } from '../envelope/envelope.data';
import { ArtSVG, frameOf } from './editor.data';
import { fitInside, halfExtent } from './bounds';
import { useEditorStore, type CardEl, type PageId } from './useEditorStore';
import e from './editor.module.css';

const SNAP = 5;
type Mode = 'move' | 'scale' | 'rotate';
type Guides = { v: boolean; h: boolean };

const PHOTO = <svg viewBox="0 0 24 24" width="34%" height="34%" fill="none" stroke="#9aa1b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-8 9" /></svg>;

/** Khung ảnh: hình dạng cắt bằng border-radius hoặc clipPath; chưa có ảnh thì hiện ô trống. */
export function FrameView({ el }: { el: CardEl }) {
  const f = frameOf(el.art);
  const id = useId().replace(/:/g, '');
  const img: CSSProperties = el.src ? { backgroundImage: `url(\"${el.src}\")`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: '#e4e7ee' };
  const fill = (
    <div className={e.frameFill} style={{ ...img, borderRadius: f.radius, clipPath: f.d ? `url(#${id})` : undefined }}>
      {!el.src && PHOTO}
    </div>
  );
  return (
    <>
      {f.d && <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden><clipPath id={id} clipPathUnits="objectBoundingBox"><path d={f.d} /></clipPath></svg>}
      {f.polaroid
        ? <div className={e.polaroid}><div className={e.frameFill} style={img}>{!el.src && PHOTO}</div></div>
        : fill}
    </>
  );
}

/** Lớp phủ nhận nét vẽ tay khi đang ở tab Vẽ. Tọa độ quy về hệ thiết kế 500×700. */
function DrawLayer({ rootRef, pageId }: { rootRef: RefObject<HTMLDivElement | null>; pageId: PageId }) {
  const cfg = useEditorStore((s) => s.draw);
  const [pts, setPts] = useState<[number, number][]>([]);
  const live = useRef<[number, number][]>([]);

  function at(ev: RPointerEvent): [number, number] {
    const r = rootRef.current!.getBoundingClientRect();
    const k = r.width / PAGE.w;
    // kẹp trong trang: nét vẽ không được lan ra ngoài viền / sang trang bên cạnh dù con trỏ đã ra ngoài (pointer capture)
    return [Math.min(PAGE.w, Math.max(0, (ev.clientX - r.left) / k)), Math.min(PAGE.h, Math.max(0, (ev.clientY - r.top) / k))];
  }
  function down(ev: RPointerEvent) {
    if (!rootRef.current) return;
    ev.preventDefault();
    ev.stopPropagation();                       // nét vẽ ngang không được kích hoạt cử chỉ lật trang của FoldingCard
    ev.currentTarget.setPointerCapture(ev.pointerId);
    const st = useEditorStore.getState();
    if (st.page !== pageId) st.setPage(pageId); // trang trái / phải: vẽ lên trang nào thì trang đó thành trang đang chỉnh
    st.select(null);
    live.current = [at(ev)];
    setPts(live.current);
  }
  function move(ev: RPointerEvent) {
    if (!live.current.length) return;
    const p = at(ev), last = live.current[live.current.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 1.5) return;
    live.current = [...live.current, p];
    setPts(live.current);
  }
  function up() {
    if (live.current.length === 1) live.current = [live.current[0], [live.current[0][0] + 0.1, live.current[0][1]]];   // chạm một điểm -> chấm tròn
    useEditorStore.getState().addStroke(live.current);
    live.current = [];
    setPts([]);
  }
  const d = pts.length ? 'M' + pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('L') : '';
  const marker = cfg.tool === 'marker';
  return (
    <div className={e.drawLayer} data-draw="" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Vùng vẽ tay">
      <svg viewBox={`0 0 ${PAGE.w} ${PAGE.h}`} width="100%" height="100%" style={{ overflow: 'visible', pointerEvents: 'none' }} aria-hidden>
        {d && <path d={d} fill="none" stroke={cfg.color} strokeWidth={marker ? cfg.size * 2.4 : cfg.size} strokeOpacity={marker ? 0.45 : 1} strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </div>
  );
}

function ElNode({ el, editable, selected, rootRef, setGuides }: {
  el: CardEl; editable: boolean; selected: boolean; rootRef: RefObject<HTMLDivElement | null>; setGuides: (g: Guides) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const editing = useEditorStore((s) => s.editingId === el.id);
  const [hMeasured, setHMeasured] = useState<number | undefined>();

  // Luôn giữ phần tử trong trang: bắt mọi trường hợp ngoài kéo-thả (đổi cỡ chữ, đổi phông, gõ thêm dòng, nhân đôi, mẫu cũ…).
  useEffect(() => {
    const n = ref.current;
    if (!editable || editing || !n) return;
    const fix = () => {
      const h = n.offsetHeight;
      setHMeasured((p) => (p === h ? p : h));
      const p = fitInside(el, el.kind === 'text' ? h : undefined);
      if (p) useEditorStore.getState().patch(el.id, p);
    };
    fix();
    const ro = new ResizeObserver(fix);
    ro.observe(n);
    return () => ro.disconnect();
  }, [el, editable, editing]);

  // vào chế độ gõ chữ: nạp nội dung, focus và bôi đen toàn bộ
  useEffect(() => {
    const n = textRef.current;
    if (!editing || !n) return;
    n.innerText = el.text ?? '';
    n.focus();
    const r = document.createRange();
    r.selectNodeContents(n);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  function begin(ev: RPointerEvent, mode: Mode) {
    if (!editable || editing || !ref.current || !rootRef.current) return;
    ev.stopPropagation();
    ev.preventDefault();
    const st = useEditorStore.getState();
    st.select(el.id);

    const sc = rootRef.current.getBoundingClientRect().width / PAGE.w; // px màn hình / đơn vị thiết kế
    const nr = ref.current.getBoundingClientRect();
    const cx = nr.left + nr.width / 2, cy = nr.top + nr.height / 2;
    const sx = ev.clientX, sy = ev.clientY;
    const a0 = Math.atan2(sy - cy, sx - cx);
    const d0 = Math.hypot(sx - cx, sy - cy) || 1;
    const h0 = ref.current.offsetHeight;
    const o = { ...el };
    const midX = o.x + o.w / 2, midY = o.y + (el.kind === 'text' ? h0 : o.h) / 2;
    let recorded = false;

    const move = (m: PointerEvent) => {
      if (!recorded) {
        if (Math.hypot(m.clientX - sx, m.clientY - sy) < 3) return;
        st.checkpoint();
        recorded = true;
      }
      if (mode === 'move') {
        let x = o.x + (m.clientX - sx) / sc, y = o.y + (m.clientY - sy) / sc;
        // chặn ở viền trang (tính cả khi đã xoay)
        const lim = fitInside({ ...o, x, y, kind: el.kind }, h0);
        if (lim?.x !== undefined) x = lim.x;
        if (lim?.y !== undefined) y = lim.y;
        const g = { v: false, h: false };
        if (Math.abs(x + o.w / 2 - PAGE.w / 2) < SNAP) { x = PAGE.w / 2 - o.w / 2; g.v = true; }
        if (Math.abs(y + h0 / 2 - PAGE.h / 2) < SNAP) { y = PAGE.h / 2 - h0 / 2; g.h = true; }
        setGuides(g);
        st.patch(el.id, { x, y });
      } else if (mode === 'scale') {
        const k = Math.max(0.15, Math.hypot(m.clientX - cx, m.clientY - cy) / d0);
        const w = o.w * k;
        if (el.kind === 'text') {
          const next = { ...o, w, size: (o.size ?? 32) * k, x: midX - w / 2, y: midY - (h0 * k) / 2 };
          st.patch(el.id, { ...next, ...fitInside(next, h0 * k) });
        } else {
          const next = { ...o, w, h: o.h * k, x: midX - w / 2, y: midY - (o.h * k) / 2 };
          st.patch(el.id, { ...next, ...fitInside(next) });
        }
      } else {
        let r = o.rot + ((Math.atan2(m.clientY - cy, m.clientX - cx) - a0) * 180) / Math.PI;
        const near = Math.round(r / 45) * 45;
        if (Math.abs(r - near) < 3) r = near;
        st.patch(el.id, { rot: r, ...fitInside({ ...o, rot: r }, h0) });
      }
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setGuides({ v: false, h: false });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  const style: CSSProperties = {
    left: el.x, top: el.y, width: el.w,
    height: el.kind === 'text' ? 'auto' : el.h,
    transform: `rotate(${el.rot}deg)`,
    opacity: el.kind === 'draw' ? undefined : el.op,
  };
  // tay nắm xoay mặc định nằm phía trên; sát mép trên của trang thì chuyển xuống dưới để không bị che / ra ngoài
  const hh = el.kind === 'text' ? (hMeasured ?? el.h) : el.h;
  const rotBelow = el.y + hh / 2 - halfExtent(el.w, hh, el.rot).hy < 40;
  const flip = { transform: `scale(${el.flipX ? -1 : 1}, ${el.flipY ? -1 : 1})` };

  return (
    <div ref={ref} className={e.node} style={style} data-el="" data-id={el.id} data-selected={selected}
      onPointerDown={(ev) => begin(ev, 'move')}
      onDoubleClick={() => editable && el.kind === 'text' && useEditorStore.getState().edit(el.id)}>
      {el.kind === 'text' && (
        <div
          key={editing ? 'edit' : 'view'}
          ref={textRef}
          className={e.text}
          contentEditable={editing}
          suppressContentEditableWarning
          spellCheck={false}
          style={{ fontFamily: `'${el.font}', system-ui, sans-serif`, fontSize: el.size, fontWeight: el.bold ? 700 : 400, color: el.color, textAlign: el.align }}
          onKeyDown={(k) => { k.stopPropagation(); if (k.key === 'Escape') (k.currentTarget as HTMLElement).blur(); }}
          onBlur={() => {
            if (!editing) return;
            const st = useEditorStore.getState();
            const t = (textRef.current?.innerText ?? '').replace(/\n$/, '');
            if (t !== el.text) { st.checkpoint(); st.patch(el.id, { text: t || ' ' }); }
            st.edit(null);
          }}
        >
          {editing ? null : el.text}
        </div>
      )}
      {(el.kind === 'sticker' || el.kind === 'shape' || el.kind === 'threed') && (
        <div className={e.fill} style={flip}><ArtSVG id={el.art ?? 'star'} color={el.color ?? '#000'} strokeWidth={el.sw ?? 6} /></div>
      )}
      {el.kind === 'frame' && <div className={e.fill} style={flip}><FrameView el={el} /></div>}
      {el.kind === 'draw' && (
        <svg className={e.fill} viewBox={`0 0 ${el.vw ?? el.w} ${el.vh ?? el.h}`} preserveAspectRatio="none" style={{ overflow: 'visible', opacity: el.op }} aria-hidden>
          <path d={el.path} fill="none" stroke={el.color} strokeWidth={el.sw ?? 6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {el.kind === 'image' && <img className={e.fill} src={el.src} alt="" draggable={false} style={flip} />}

      {selected && !editing && (
        <div className={e.box}>
          {(['nw', 'ne', 'se', 'sw'] as const).map((p) => <span key={p} className={e.h} data-p={p} onPointerDown={(ev) => begin(ev, 'scale')} />)}
          <span className={e.rot} data-below={rotBelow} onPointerDown={(ev) => begin(ev, 'rotate')} aria-label="Xoay">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#222" strokeWidth="2.4" strokeLinecap="round"><path d="M20 12a8 8 0 1 1-3-6.2M20 4v5h-5" /></svg>
          </span>
        </div>
      )}
    </div>
  );
}

export function PageEditor({ pageId, editable }: { pageId: PageId; editable: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const els = useEditorStore((s) => s.pages[pageId]);
  const drawing = useEditorStore((s) => s.draw.on);   // lớp vẽ có mặt ở MỌI trang đang chỉnh được (trang trái + phải)
  const selectedId = useEditorStore((s) => s.selectedId);
  const showSafe = useEditorStore((s) => s.showSafe && s.page === pageId);
  const [guides, setGuides] = useState<Guides>({ v: false, h: false });

  // Chạm vào trang nào (đối tượng, vùng trống hay lớp vẽ) thì trang đó thành trang đang chỉnh.
  // Chạy ở pha capture nên xong TRƯỚC khi đối tượng được chọn; chốt ô chữ đang gõ ở trang kia để không mất nội dung.
  function activate() {
    if (!editable) return;
    const st = useEditorStore.getState();
    if (st.page === pageId) return;
    const a = document.activeElement;
    if (a instanceof HTMLElement && a.isContentEditable) a.blur();
    st.setPage(pageId);
  }

  /* Trình duyệt đôi khi trả về chính .page làm target của pointerdown / hover dù ngay dưới con trỏ có đối tượng
     (hit-test thật lệch với elementsFromPoint do các lớp 3D chồng nhau của bìa) -> đối tượng không chọn / hover được, chỉ lật trang.
     Nên tự tìm đối tượng nằm trên cùng dưới con trỏ rồi chuyển sự kiện cho nó. */
  function topNode(x: number, y: number): HTMLElement | null {
    const r = root.current;
    if (!r) return null;
    for (const n of document.elementsFromPoint(x, y)) {
      if (n === r) return null;
      if (r.contains(n)) return n as HTMLElement;
    }
    return null;
  }
  function redirectDown(ev: RPointerEvent) {
    if (!editable || ev.target !== ev.currentTarget) return;
    const t = topNode(ev.clientX, ev.clientY);
    if (!t) return;
    ev.stopPropagation();
    t.dispatchEvent(new PointerEvent('pointerdown', {
      bubbles: true, cancelable: true, composed: true, view: window,
      clientX: ev.clientX, clientY: ev.clientY, screenX: ev.screenX, screenY: ev.screenY,
      pointerId: ev.pointerId, pointerType: ev.pointerType, isPrimary: ev.isPrimary,
      button: ev.button, buttons: ev.buttons, pressure: ev.pressure, ctrlKey: ev.ctrlKey, shiftKey: ev.shiftKey, altKey: ev.altKey, metaKey: ev.metaKey,
    }));
  }
  const hot = useRef<HTMLElement | null>(null);
  function hover(ev: RPointerEvent | null) {
    const t = ev && editable && ev.target === ev.currentTarget ? topNode(ev.clientX, ev.clientY)?.closest<HTMLElement>('[data-el]') ?? null : null;
    if (t === hot.current) return;
    hot.current?.removeAttribute('data-hot');
    hot.current = t;
    t?.setAttribute('data-hot', 'true');
    if (root.current) root.current.style.cursor = t ? 'move' : '';
  }

  return (
    <div ref={root} className={e.page} data-editable={editable}
      onPointerDownCapture={(ev) => { activate(); redirectDown(ev); }}
      onPointerMove={hover}
      onPointerLeave={() => hover(null)}
      onPointerDown={(ev) => { if (editable && ev.target === ev.currentTarget) useEditorStore.getState().select(null); }}>
      {editable && els.length === 0 && !drawing && (
        <p className={e.emptyHint} aria-hidden>Trang trống · thêm chữ, ảnh hoặc hình từ thanh công cụ bên trái</p>
      )}
      {els.map((el) => (
        <ElNode key={el.id} el={el} editable={editable} selected={editable && selectedId === el.id} rootRef={root} setGuides={setGuides} />
      ))}
      {editable && drawing && <DrawLayer rootRef={root} pageId={pageId} />}
      {editable && showSafe && <i className={e.safe} aria-hidden />}
      {editable && guides.v && <i className={e.guideV} />}
      {editable && guides.h && <i className={e.guideH} />}
    </div>
  );
}