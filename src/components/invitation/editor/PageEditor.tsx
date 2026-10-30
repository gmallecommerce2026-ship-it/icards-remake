// src/components/invitation/editor/PageEditor.tsx
'use client';

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type RefObject } from 'react';
import { PAGE } from '../envelope/envelope.data';
import { StickerArt } from './editor.data';
import { useEditorStore, type CardEl, type PageId } from './useEditorStore';
import e from './editor.module.css';

const SNAP = 5;
type Mode = 'move' | 'scale' | 'rotate';
type Guides = { v: boolean; h: boolean };

function ElNode({ el, editable, selected, rootRef, setGuides }: {
  el: CardEl; editable: boolean; selected: boolean; rootRef: RefObject<HTMLDivElement | null>; setGuides: (g: Guides) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const editing = useEditorStore((s) => s.editingId === el.id);

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
        const g = { v: false, h: false };
        if (Math.abs(x + o.w / 2 - PAGE.w / 2) < SNAP) { x = PAGE.w / 2 - o.w / 2; g.v = true; }
        if (Math.abs(y + h0 / 2 - PAGE.h / 2) < SNAP) { y = PAGE.h / 2 - h0 / 2; g.h = true; }
        setGuides(g);
        st.patch(el.id, { x, y });
      } else if (mode === 'scale') {
        const k = Math.max(0.15, Math.hypot(m.clientX - cx, m.clientY - cy) / d0);
        const w = o.w * k;
        if (el.kind === 'text') st.patch(el.id, { w, size: (o.size ?? 32) * k, x: midX - w / 2, y: midY - (h0 * k) / 2 });
        else st.patch(el.id, { w, h: o.h * k, x: midX - w / 2, y: midY - (o.h * k) / 2 });
      } else {
        let r = o.rot + ((Math.atan2(m.clientY - cy, m.clientX - cx) - a0) * 180) / Math.PI;
        const near = Math.round(r / 45) * 45;
        if (Math.abs(r - near) < 3) r = near;
        st.patch(el.id, { rot: r });
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
  };
  const flip = { transform: `scale(${el.flipX ? -1 : 1}, ${el.flipY ? -1 : 1})` };

  return (
    <div ref={ref} className={e.node} style={style}
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
      {el.kind === 'sticker' && <div className={e.fill} style={flip}><StickerArt id={el.art ?? 'star'} color={el.color ?? '#000'} /></div>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {el.kind === 'image' && <img className={e.fill} src={el.src} alt="" draggable={false} style={flip} />}

      {selected && !editing && (
        <div className={e.box}>
          {(['nw', 'ne', 'se', 'sw'] as const).map((p) => <span key={p} className={e.h} data-p={p} onPointerDown={(ev) => begin(ev, 'scale')} />)}
          <span className={e.rot} onPointerDown={(ev) => begin(ev, 'rotate')} aria-label="Xoay">
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
  const selectedId = useEditorStore((s) => s.selectedId);
  const [guides, setGuides] = useState<Guides>({ v: false, h: false });

  return (
    <div ref={root} className={e.page} data-editable={editable}
      onPointerDown={(ev) => { if (editable && ev.target === ev.currentTarget) useEditorStore.getState().select(null); }}>
      {els.map((el) => (
        <ElNode key={el.id} el={el} editable={editable} selected={editable && selectedId === el.id} rootRef={root} setGuides={setGuides} />
      ))}
      {editable && guides.v && <i className={e.guideV} />}
      {editable && guides.h && <i className={e.guideH} />}
    </div>
  );
}