// src/components/invitation/envelope/EnvelopeDesigner.tsx
'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { getTemplateBySlug } from '@/lib/templates';
import { ROUTES } from '@/lib/routes';
import { EnvelopeScene } from './EnvelopeScene';
import { Stamp, STAMPS } from './Stamp';
import { ENVELOPES, LINERS, TONES, type Tone } from './envelope.data';
import { FoldingCard } from '../editor/FoldingCard';
import { useCardMotion } from '../editor/useCardMotion';
import { CardPanel } from '../editor/CardPanel';
import { ActionBar, TextToolbar } from '../editor/Toolbars';
import { FONTS_URL } from '../editor/editor.data';
import { PAGES, useEditorStore, type PageId, type Snap } from '../editor/useEditorStore';
import d from './EnvelopeDesigner.module.css';

type Tab = 'card' | 'envelope' | 'liner' | 'stamp';

function Ico({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden>{children}</svg>;
}
const TABS: { id: Tab; label: string; icon: ReactNode; title: string; search: string }[] = [
  { id: 'card', label: 'Thiệp', title: 'Thiệp', search: '', icon: <Ico><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M9 8h6M9 12h6M9 16h3" /></Ico> },
  { id: 'envelope', label: 'Phong bì', title: 'Phong bì', search: 'Tìm phong bì', icon: <Ico><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M3 6.5l9 7 9-7" /></Ico> },
  { id: 'liner', label: 'Lớp lót', title: 'Lớp lót', search: 'Tìm lớp lót', icon: <Ico><path d="M3 10l9-6 9 6v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M3 10l9 6 9-6" /></Ico> },
  { id: 'stamp', label: 'Tem', title: 'Tem', search: 'Tìm tem', icon: <Ico><rect x="4" y="4" width="16" height="16" rx="1" strokeDasharray="2 1.6" /><rect x="8" y="8" width="8" height="8" /></Ico> },
];

function Item({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: ReactNode }) {
  return <button type="button" className={d.item} aria-pressed={active} aria-label={label} title={label} onClick={onClick}>{children}</button>;
}
function EnvelopeThumb({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 70" width="100%" aria-hidden>
      <rect width="100" height="70" fill={color} />
      <path d="M0 0L50 40L100 0M0 70L42 32M100 70L58 32" fill="none" stroke="#000" strokeOpacity=".22" strokeWidth="1.5" />
    </svg>
  );
}

type Props = { recipientName?: string; editable?: boolean; templateSlug?: string | null };

const DOTS: PageId[] = ['cover', 'inside', 'back'];
const draftKey = (slug?: string | null) => `icards:draft:${slug ?? 'blank'}`;

export function EnvelopeDesigner({ recipientName, editable = false, templateSlug }: Props) {
  const template = templateSlug ? getTemplateBySlug(templateSlug) : undefined;
  const [tab, setTab] = useState<Tab>(editable ? 'card' : 'envelope');
  const [envId, setEnvId] = useState(ENVELOPES[0].id);
  const [linerId, setLinerId] = useState(LINERS[0].id);
  const [stampId, setStampId] = useState(STAMPS[0].id);
  const [side, setSide] = useState<'front' | 'back'>('back');
  const [flapOpen, setFlapOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [tone, setTone] = useState<Tone | null>(null);
  const [cardFront, setCardFront] = useState(editable);
  const [view, setViewState] = useState<PageId>('cover');
  const [mode, setMode] = useState<'edit' | 'preview'>(editable ? 'edit' : 'preview');
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [playing, setPlaying] = useState(false);
  const [settled, setSettled] = useState(editable); // thiệp đã rút ra xong, đứng yên -> mới cho chỉnh sửa
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cm = useCardMotion(view);

  const canEdit = editable && mode === 'edit' && cardFront && settled && !playing && !cm.busy;
  const canUndo = useEditorStore((s) => s.past.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const editing = useEditorStore((s) => s.editingId !== null);
  const sel = useEditorStore((s) => {
    for (const p of PAGES) {
      const f = s.pages[p].find((x) => x.id === s.selectedId);
      if (f) return f;
    }
    return null;
  });

  // Nạp phông chữ một lần (thiệp dùng cả ở chế độ xem)
  useEffect(() => {
    if (document.getElementById('inv-fonts')) return;
    const l = document.createElement('link');
    l.id = 'inv-fonts';
    l.rel = 'stylesheet';
    l.href = FONTS_URL;
    document.head.appendChild(l);
  }, []);

  // Phím tắt khi đang chỉnh sửa
  useEffect(() => {
    if (!canEdit) return;
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.target as HTMLElement).closest('input,select,textarea,[contenteditable="true"]')) return;
      const st = useEditorStore.getState();
      const mod = ev.ctrlKey || ev.metaKey;
      const key = ev.key.toLowerCase();
      if (mod && key === 'z') { ev.preventDefault(); if (ev.shiftKey) st.redo(); else st.undo(); }
      else if (mod && key === 'y') { ev.preventDefault(); st.redo(); }
      else if ((ev.key === 'Delete' || ev.key === 'Backspace') && st.selectedId) { ev.preventDefault(); st.remove(st.selectedId); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canEdit]);

  const env = ENVELOPES.find((e) => e.id === envId)!;
  const liner = LINERS.find((l) => l.id === linerId)!;
  const tabs = editable ? TABS : TABS.filter((t) => t.id !== 'card');
  const cur = TABS.find((t) => t.id === tab)!;

  const q = query.trim().toLowerCase();
  const ok = (name: string, t: Tone) => (!q || name.toLowerCase().includes(q)) && (!tone || t === tone);
  const envelopes = ENVELOPES.filter((e) => ok(e.name, e.tone));
  const liners = LINERS.filter((l) => ok(l.name, l.tone));
  const stamps = STAMPS.filter((x) => ok(x.name, x.tone));
  const shown = tab === 'envelope' ? envelopes.length : tab === 'liner' ? liners.length : tab === 'stamp' ? stamps.length : 1;

  const setView = useCallback((v: PageId) => {
    setViewState(v);
    useEditorStore.getState().setPage(v);
  }, []);
  const later = (ms: number, fn: () => void) => { timers.current.push(setTimeout(fn, ms)); };

  // Thiệp chưa ra khỏi phong bì thì: mở nắp (nếu đang đóng) -> rút thiệp ra -> rồi mới chạy việc tiếp theo
  function pullOut(then?: () => void) {
    if (cardFront) { then?.(); return; }
    useEditorStore.getState().select(null);
    let wait = 0;
    if (!flapOpen) { setFlapOpen(true); wait = 1700; }
    later(wait, () => setCardFront(true));
    if (then) later(wait + 2500, then);
  }
  function insertCard() {
    useEditorStore.getState().select(null);
    setView('cover');          // khép thiệp lại (nếu đang mở / ở mặt sau) trước khi cất
    later(closeWait(), () => setCardFront(false));
  }
  // thời gian khép thiệp về bìa (bìa đóng) trước khi đút vào phong bì
  function closeWait() { return view === 'cover' ? 0 : view === 'inside' ? 1400 : 2700; }
  function onViewChange(v: PageId) { stopPlay(); setView(v); }
  // chạm vào phong bì: thiệp đang ở ngoài thì CẤT VÀO; ngược lại chạm vào mặt địa chỉ thì lật phong bì, chạm vào mặt nắp thì đóng/mở nắp
  function onEnvClick(face: 'front' | 'back') {
    if (playing) return;
    stopPlay();
    if (cardFront) insertCard();
    else if (face === 'front') setSide('back');
    else setFlapOpen((v) => !v);
  }
  function selectTab(t: Tab) {
    stopPlay();
    setTab(t); setQuery(''); setTone(null);
    useEditorStore.getState().select(null);
    if (t === 'card') {
      setCardFront(true); setSide('back'); setFlapOpen(true);
    } else {
      // khép thiệp (nếu đang mở) rồi mới đút vào phong bì
      setView('cover');
      later(closeWait(), () => setCardFront(false));
      setSide(t === 'stamp' ? 'front' : 'back');
      if (t !== 'stamp') setFlapOpen(true);
    }
  }

  // ---- Phát thử toàn bộ hiệu ứng: phong bì đóng → mở nắp → rút thiệp → mở thiệp → mặt sau
  function stopPlay() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPlaying(false);
  }
  // thiệp chỉ cho chỉnh sửa khi đã rút ra xong và đứng yên
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!cardFront) { setSettled(false); return; }
    const id = setTimeout(() => setSettled(true), 2500);
    return () => clearTimeout(id);
  }, [cardFront]);
  function play() {
    stopPlay();
    useEditorStore.getState().select(null);
    setPlaying(true);
    setMode('preview');
    setTab(editable ? 'card' : 'envelope');
    setView('cover'); setCardFront(false); setSide('back'); setFlapOpen(false);
    const at = later;
    at(900, () => setFlapOpen(true));        // nắp mở chậm, thiệp (nằm ngang) trồi lên khỏi miệng phong bì
    at(3300, () => setCardFront(true));      // thiệp trượt ra, xoay dọc, bay vòng cung ra trước
    at(6300, () => setView('inside'));       // bìa lật quanh gáy
    at(8500, () => setView('back'));         // khép bìa rồi lật cả tấm thiệp
    at(11500, () => setView('cover'));       // lật về, khép lại
    at(14600, () => setCardFront(false));    // xoay ngang rồi trượt vào phong bì
    at(17400, () => setFlapOpen(false));     // đóng nắp
    at(19200, () => setPlaying(false));
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // ---- Nghiêng 3D theo con trỏ (chỉ ở chế độ xem, không nghiêng khi đang chỉnh sửa để thao tác chính xác)
  const tiltOn = !canEdit;
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const rx = useSpring(tx, { stiffness: 120, damping: 18 });
  const ry = useSpring(ty, { stiffness: 120, damping: 18 });
  function onStageMove(ev: React.PointerEvent<HTMLElement>) {
    if (!tiltOn || ev.pointerType === 'touch') return;
    const r = ev.currentTarget.getBoundingClientRect();
    const nx = (ev.clientX - r.left) / r.width - 0.5;
    const ny = (ev.clientY - r.top) / r.height - 0.5;
    ty.set(nx * 14);
    tx.set(-ny * 10);
  }
  function onStageLeave() { tx.set(0); ty.set(0); }
  useEffect(() => { if (!tiltOn) { tx.set(0); ty.set(0); } }, [tiltOn, tx, ty]);

  // ---- Nạp nội dung: bản nháp đã lưu → mẫu → mặc định
  useEffect(() => {
    const st = useEditorStore.getState();
    let loaded = false;
    try {
      const raw = localStorage.getItem(draftKey(templateSlug));
      if (raw) { st.hydrate(JSON.parse(raw) as Snap); loaded = true; }
    } catch { /* bỏ qua bản nháp hỏng */ }
    if (!loaded && template) st.loadTemplate(template);
    st.setPage('cover');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateSlug]);

  // ---- Tự lưu nháp (debounce) khi nội dung đổi
  const saveNow = useCallback(() => {
    const { pages, backdrops } = useEditorStore.getState();
    try { localStorage.setItem(draftKey(templateSlug), JSON.stringify({ pages, backdrops })); setSaved('saved'); }
    catch { setSaved('idle'); alert('Không lưu được bản nháp (bộ nhớ trình duyệt đầy). Hãy dùng ảnh nhỏ hơn.'); }
  }, [templateSlug]);
  useEffect(() => {
    if (!editable || !ready) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const unsub = useEditorStore.subscribe((s, p) => {
      if (s.pages === p.pages && s.backdrops === p.backdrops) return;
      setSaved('saving');
      clearTimeout(t);
      t = setTimeout(saveNow, 800);
    });
    return () => { unsub(); clearTimeout(t); };
  }, [editable, ready, saveNow]);

  return (
    <div className={d.root}>
      <header className={d.top}>
        <Link href={ROUTES.invitationManagement} className={d.back} aria-label="Quay lại quản lý thiệp mời">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
          <span>Thoát</span>
        </Link>
        <div className={d.heading}>
          <b>{template ? template.name : 'Thiệp mới'}</b>
          {editable && <small>{saved === 'saving' ? 'Đang lưu…' : saved === 'saved' ? 'Đã lưu nháp' : 'Tự động lưu nháp'}</small>}
        </div>
        <div className={d.topActions}>
          {canEdit && (
            <div className={d.history} role="group" aria-label="Lịch sử chỉnh sửa">
              <button type="button" disabled={!canUndo} onClick={() => useEditorStore.getState().undo()}>Hoàn tác</button>
              <button type="button" disabled={!canRedo} onClick={() => useEditorStore.getState().redo()}>Làm lại</button>
            </div>
          )}
          {editable && (
            <div className={d.modeSwitch} role="group" aria-label="Chế độ">
              <button type="button" aria-pressed={mode === 'edit'} onClick={() => { stopPlay(); setMode('edit'); }}>Chỉnh sửa</button>
              <button type="button" aria-pressed={mode === 'preview'} onClick={() => { stopPlay(); setMode('preview'); useEditorStore.getState().select(null); }}>Xem thử</button>
            </div>
          )}
          <button type="button" className={d.play} onClick={playing ? stopPlay : play}>{playing ? 'Dừng' : '▶ Phát hiệu ứng'}</button>
          {editable && <button type="button" className={d.save} onClick={saveNow}>Lưu</button>}
        </div>
      </header>
      <div className={d.body}>
      <nav className={d.tabs} role="tablist" aria-label="Tùy chỉnh thiệp và phong bì">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" className={d.tab} aria-selected={tab === t.id} onClick={() => selectTab(t.id)}>
            {t.icon}<span>{t.label}</span>
          </button>
        ))}
      </nav>

      <aside className={d.panel}>
        {tab === 'card' ? (
          <>
            <h2 className={d.title}>{cur.title}</h2>
            <CardPanel />
          </>
        ) : (
          <>
            <input className={d.search} type="search" placeholder={cur.search} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={cur.search} />
            <p className={d.label}>Lọc theo màu</p>
            <div className={d.chips}>
              {TONES.map((t) => (
                <button key={t.id} type="button" className={d.chip} style={{ background: t.color }} aria-label={t.id} aria-pressed={tone === t.id} onClick={() => setTone(tone === t.id ? null : t.id)} />
              ))}
            </div>
            <h2 className={d.title}>{cur.title}</h2>
            <div className={d.grid}>
              {tab === 'envelope' && envelopes.map((e) => <Item key={e.id} active={e.id === envId} label={e.name} onClick={() => setEnvId(e.id)}><EnvelopeThumb color={e.color} /></Item>)}
              {tab === 'liner' && liners.map((l) => <Item key={l.id} active={l.id === linerId} label={l.name} onClick={() => setLinerId(l.id)}><div className={d.liner} style={{ background: l.background }} /></Item>)}
              {tab === 'stamp' && stamps.map((x) => <Item key={x.id} active={x.id === stampId} label={x.name} onClick={() => setStampId(x.id)}><Stamp id={x.id} /></Item>)}
              {shown === 0 && <p className={d.empty}>Không tìm thấy kết quả</p>}
            </div>
          </>
        )}
      </aside>

      <main className={d.stage} onPointerMove={onStageMove} onPointerLeave={onStageLeave}>
        {!(canEdit && sel) && (
          <button type="button" className={d.flip} aria-label="Lật phong bì" onClick={() => setSide((v) => (v === 'front' ? 'back' : 'front'))}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 11a8 6 0 0 1 14-3" /><path d="M18 4v4h-4" /><path d="M20 13a8 6 0 0 1-14 3" /><path d="M6 20v-4h4" />
            </svg>
          </button>
        )}

        <motion.div className={d.scene} style={{ rotateX: tiltOn ? rx : 0, rotateY: tiltOn ? ry : 0, transformPerspective: 1600 }}>
          {ready && <EnvelopeScene
            card={<FoldingCard cm={cm} view={view} editable={canEdit} gesture={cardFront && settled && !playing} onViewChange={onViewChange} />}
            envelopeColor={env.color}
            liner={liner.background}
            stampId={stampId}
            recipientName={recipientName}
            side={side}
            flapOpen={flapOpen}
            cardFront={cardFront}
            openAmt={cm.open}
            onEnvClick={onEnvClick}
            onCardClick={() => { if (!playing) { stopPlay(); pullOut(); } }}
          />}
        </motion.div>

        {canEdit && sel?.kind === 'text' && <TextToolbar el={sel} />}
        {canEdit && sel && !editing && <ActionBar el={sel} />}

        {!playing && !(canEdit && sel) && (
          <p className={d.hint} aria-live="polite">
            {cardFront
              ? (canEdit || (editable && mode === 'edit')
                  ? 'Nhấn giữ vùng trống của thiệp rồi kéo sang trái / phải để lật trang · chạm vào phong bì phía sau để cất thiệp'
                  : 'Nhấn giữ thiệp rồi kéo sang trái để mở, sang phải để đóng · chạm vào phong bì phía sau để cất thiệp')
              : flapOpen ? 'Chạm vào tấm thiệp để lấy ra · chạm vào nắp để đóng phong bì' : 'Chạm vào phong bì để mở nắp'}
          </p>
        )}

        {cardFront && (
          <div className={d.dots} aria-hidden>
            {DOTS.map((v) => <i key={v} data-on={view === v} />)}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}