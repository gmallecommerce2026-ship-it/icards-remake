// src/components/invitation/envelope/FlapDebugPanel.tsx
// Panel debug nắp phong bì. Chỉ hiện khi bật ?flapdebug=1 (xem flapDebug.ts). Render qua portal ra <body>.
'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import type { MotionValue } from 'motion/react';
import { FLAP_N, FLAP_SUM } from './EnvelopeFlap';
import { dbg, dbgLog, isDbgOn, setDbgOn } from './flapDebug';

type Props = {
  sceneRef: RefObject<HTMLElement | null>;
  flapRot: MotionValue<number>;
  curl: MotionValue<number>;
  flip: MotionValue<number>;
  t: MotionValue<number>;
  rise: MotionValue<number>;
  backAmt: MotionValue<number>;
  info: Record<string, unknown>;        // props / kích thước hiện tại của scene
};

const R = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const frames = (n: number) => new Promise<void>((res) => {
  const step = (k: number) => (k <= 0 ? res() : requestAnimationFrame(() => step(k - 1)));
  step(n);
});

/* ------------------------------------------------------------------ */
/*  Đọc DOM                                                             */
/* ------------------------------------------------------------------ */
const sel = (el: Element) => {
  const c = typeof (el as HTMLElement).className === 'string' ? (el as HTMLElement).className.split(/\s+/)[0] : '';
  const d = Array.from(el.attributes)
    .filter((a) => a.name.startsWith('data-') && !a.name.startsWith('data-fdbg'))
    .map((a) => `[${a.name}${a.value ? '=' + a.value : ''}]`)
    .join('');
  return el.tagName.toLowerCase() + (c ? '.' + c : '') + d;
};

/** Các thuộc tính CSS ép trình duyệt "làm phẳng" (bỏ preserve-3d) phần tử này */
function flattenReasons(cs: CSSStyleDeclaration): string[] {
  const r: string[] = [];
  if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') r.push(`overflow:${cs.overflowX}/${cs.overflowY}`);
  if (parseFloat(cs.opacity) < 1) r.push('opacity:' + cs.opacity);
  if (cs.filter !== 'none') r.push('filter');
  if (cs.getPropertyValue('clip-path') !== 'none') r.push('clip-path');
  const mask = cs.getPropertyValue('mask-image') || cs.getPropertyValue('-webkit-mask-image');
  if (mask && mask !== 'none') r.push('mask');
  if (cs.getPropertyValue('mix-blend-mode') !== 'normal') r.push('mix-blend-mode');
  if (cs.getPropertyValue('isolation') === 'isolate') r.push('isolation');
  const bf = cs.getPropertyValue('backdrop-filter');
  if (bf && bf !== 'none') r.push('backdrop-filter');
  if (/paint|strict|content/.test(cs.getPropertyValue('contain'))) r.push('contain:' + cs.getPropertyValue('contain'));
  return r;
}

/** Đi từ dải gốc của nắp lên tới phần tử có `perspective`; mọi tầng ở giữa phải preserve-3d và không bị làm phẳng */
function chainReport(root: HTMLElement) {
  const chain: Record<string, unknown>[] = [];
  let broken: string | null = null;
  let provider: Record<string, unknown> | null = null;
  let el: HTMLElement | null = root;
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el);
    const hasPersp = cs.perspective !== 'none';
    const flat = flattenReasons(cs);
    const row: Record<string, unknown> = {
      el: sel(el),
      transformStyle: cs.transformStyle,
      perspective: cs.perspective,
      perspectiveOrigin: cs.perspectiveOrigin,
      backface: cs.backfaceVisibility,
      visibility: cs.visibility,
      position: cs.position,
      flattenedBy: flat.length ? flat : undefined,
    };
    chain.push(row);
    if (hasPersp && el !== root) {
      provider = { el: sel(el), perspective: cs.perspective, origin: cs.perspectiveOrigin };
      break;
    }
    if (!broken) {
      if (cs.transformStyle !== 'preserve-3d') broken = `${sel(el)}: transform-style=${cs.transformStyle} (phải là preserve-3d)`;
      else if (flat.length) broken = `${sel(el)}: bị làm phẳng bởi ${flat.join(', ')}`;
    }
    el = el.parentElement;
  }
  return {
    verdict: !provider ? 'KHÔNG tìm thấy phần tử perspective phía trên nắp' : broken ? 'CHUỖI 3D BỊ GÃY: ' + broken : 'OK (chuỗi preserve-3d liền tới perspective)',
    provider,
    chain,
  };
}

function stripsOf(root: HTMLElement): HTMLElement[] {
  const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>('[data-seg]'))];
  return all.sort((a, b) => Number(a.dataset.seg) - Number(b.dataset.seg));
}

function parseRotX(transform: string): { kind: string; rotX: number | null } {
  if (!transform || transform === 'none') return { kind: 'none', rotX: null };
  const v = (transform.match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi) ?? []).map(Number);
  if (transform.startsWith('matrix3d') && v.length === 16) return { kind: 'matrix3d', rotX: R((Math.atan2(v[6], v[5]) * 180) / Math.PI) };
  return { kind: 'matrix2d(KHÔNG có 3D!)', rotX: null };
}

function sheetReport(root: HTMLElement, rot: number, curl: number, full: boolean) {
  const strips = stripsOf(root);
  const rows = strips.map((el, i) => {
    const cs = getComputedStyle(el);
    const { kind, rotX } = parseRotX(cs.transform);
    const expected = i === 0 ? rot : (curl * i) / FLAP_SUM;
    const r = el.getBoundingClientRect();
    return {
      i,
      kind,
      rotX,
      expectedRotX: R(expected),
      delta: rotX === null ? null : R(rotX - expected),
      top: R(r.top, 1), bottom: R(r.bottom, 1), left: R(r.left, 1), right: R(r.right, 1),
      ...(full ? { inlineStyle: (el.getAttribute('style') ?? '').slice(0, 260) } : {}),
    };
  });
  const union = {
    top: Math.min(...rows.map((r) => r.top)),
    bottom: Math.max(...rows.map((r) => r.bottom)),
    left: Math.min(...rows.map((r) => r.left)),
    right: Math.max(...rows.map((r) => r.right)),
  };
  const cs = getComputedStyle(root);
  return {
    sheet: root.dataset.sheet,
    visibility: cs.visibility,
    count: strips.length,
    expectedCount: FLAP_N,
    screenH: R(union.bottom - union.top, 1),
    screenW: R(union.right - union.left, 1),
    union,
    strips: rows,
    ...(full ? { ancestors: chainReport(root) } : {}),
  };
}

function visibleRoot(scene: HTMLElement | null): HTMLElement | null {
  if (!scene) return null;
  const roots = Array.from(scene.querySelectorAll<HTMLElement>('[data-flap-root]'));
  return roots.find((r) => getComputedStyle(r).visibility === 'visible') ?? null;
}

/* ------------------------------------------------------------------ */
/*  Panel                                                               */
/* ------------------------------------------------------------------ */
const DEF = { persp: 3000, originOn: false, drop: 457, tilt: 0, noclip: false, noshade: false, outline: false };

export function FlapDebugPanel({ sceneRef, flapRot, curl, flip, t, rise, backAmt, info }: Props) {
  const [on, setOn] = useState(false);
  const [open, setOpen] = useState(true);
  const [hud, setHud] = useState<Record<string, string>>({});
  const [tune, setTune] = useState(DEF);
  const [scrub, setScrub] = useState(false);
  const [out, setOut] = useState('');
  const [busy, setBusy] = useState(false);
  const timeline = useRef<Record<string, unknown>[]>([]);
  const infoRef = useRef(info);
  infoRef.current = info;

  useEffect(() => { setOn(isDbgOn()); }, []);

  // Ctrl+Shift+D bật/tắt panel (RequireAuth chuyển hướng sang /sign-in làm mất ?flapdebug=1 nên cần cách bật khác)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setDbgOn(!isDbgOn());
        setOn(isDbgOn());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // bắt lỗi toàn cục
  useEffect(() => {
    if (!on) return;
    const onErr = (e: ErrorEvent) => dbg('window.error', { message: e.message, file: e.filename, line: e.lineno });
    const onRej = (e: PromiseRejectionEvent) => dbg('unhandledrejection', String(e.reason));
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);
    dbg('panel:mounted', infoRef.current);
    return () => { window.removeEventListener('error', onErr); window.removeEventListener('unhandledrejection', onRej); };
  }, [on]);

  // HUD sống
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => {
      const scene = sceneRef.current;
      const root = visibleRoot(scene);
      const stage = scene?.querySelector<HTMLElement>('[data-stage3d]');
      const cs = stage ? getComputedStyle(stage) : null;
      setHud({
        flapRot: String(R(flapRot.get())),
        curl: String(R(curl.get())),
        flip: String(R(flip.get())),
        t: String(R(t.get(), 3)),
        rise: String(R(rise.get(), 3)),
        backAmt: String(R(backAmt.get(), 3)),
        visibleSheet: root?.dataset.sheet ?? '(không có)',
        perspective: cs?.perspective ?? '?',
        perspOrigin: cs?.perspectiveOrigin ?? '?',
      });
    }, 150);
    return () => clearInterval(id);
  }, [on, sceneRef, flapRot, curl, flip, t, rise, backAmt]);

  // ghi lại đường đi của góc nắp theo thời gian (mỗi frame có thay đổi)
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const start = performance.now();
    const unsub = flapRot.on('change', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const root = visibleRoot(sceneRef.current);
        const s = root ? sheetReport(root, flapRot.get(), curl.get(), false) : null;
        timeline.current.push({
          ms: Math.round(performance.now() - start),
          rot: R(flapRot.get()),
          curl: R(curl.get()),
          sheet: s?.sheet,
          screenH: s?.screenH,
          top: s ? R(s.union.top, 1) : null,
          bottom: s ? R(s.union.bottom, 1) : null,
        });
        if (timeline.current.length > 400) timeline.current.shift();
      });
    });
    return () => { unsub(); if (raf) cancelAnimationFrame(raf); };
  }, [on, sceneRef, flapRot, curl]);

  // áp các chỉnh thử (perspective / tâm phối cảnh / nghiêng / tắt clip...) bằng một thẻ <style>
  useEffect(() => {
    if (!on) return;
    const rules: string[] = [];
    if (tune.persp !== DEF.persp) rules.push(`[data-stage3d]{perspective:${tune.persp}px !important}`);
    if (tune.originOn) rules.push(`[data-stage3d]{perspective-origin:50% calc(50% + ${tune.drop}px) !important}`);
    if (tune.tilt !== 0) rules.push(`[data-envelope]{rotate:1 0 0 ${tune.tilt}deg !important}`);
    if (tune.noclip) rules.push('[data-clipbox]{clip-path:none !important}');
    if (tune.noshade) rules.push('[data-shade]{display:none !important}');
    if (tune.outline) rules.push('[data-seg]{outline:1px solid rgb(255 0 80 / .85) !important}[data-flap-root]{outline:2px solid #00c2ff !important}');
    let st = document.getElementById('fdbg-style') as HTMLStyleElement | null;
    if (!st) { st = document.createElement('style'); st.id = 'fdbg-style'; document.head.appendChild(st); }
    st.textContent = rules.join('\n');
    dbg('tune', tune);
    return () => { st?.remove(); };
  }, [on, tune]);

  const full = useCallback(() => {
    const scene = sceneRef.current;
    const rot = flapRot.get(), c = curl.get();
    const roots = scene ? Array.from(scene.querySelectorAll<HTMLElement>('[data-flap-root]')) : [];
    const stage = scene?.querySelector<HTMLElement>('[data-stage3d]');
    return {
      note: 'Báo cáo debug nắp phong bì',
      when: new Date().toISOString(),
      env: {
        ua: navigator.userAgent,
        dpr: window.devicePixelRatio,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        preserve3dSupported: typeof CSS !== 'undefined' ? CSS.supports('transform-style', 'preserve-3d') : null,
        individualRotateProp: typeof CSS !== 'undefined' ? CSS.supports('rotate', '1 0 0 10deg') : null,
        sceneInfo: infoRef.current,
      },
      values: {
        flapRot: R(rot), curl: R(c), flip: R(flip.get()), t: R(t.get(), 3), rise: R(rise.get(), 3), backAmt: R(backAmt.get(), 3),
        stagePerspective: stage ? getComputedStyle(stage).perspective : null,
        stagePerspectiveOrigin: stage ? getComputedStyle(stage).perspectiveOrigin : null,
      },
      tune,
      sheets: roots.map((r) => sheetReport(r, rot, c, true)),
    };
  }, [sceneRef, flapRot, curl, flip, t, rise, backAmt, tune]);

  const emit = (obj: unknown, label: string) => {
    const text = JSON.stringify(obj, null, 1);
    setOut(text);
    dbg(label, obj);
    navigator.clipboard?.writeText(text).catch(() => { /* người dùng tự copy từ ô bên dưới */ });
  };

  const doSnapshot = () => emit(full(), 'snapshot');

  const doSweep = async () => {
    setBusy(true);
    const orig = flapRot.get();
    const steps: Record<string, unknown>[] = [];
    for (const a of [0, 10, 20, 35, 50, 70, 90, 110, 130, 150, 170, 180]) {
      flapRot.set(a);
      await frames(12);   // để lò xo vận tốc (curl) lắng xuống
      const root = visibleRoot(sceneRef.current);
      const s = root ? sheetReport(root, flapRot.get(), curl.get(), false) : null;
      steps.push({
        angle: a,
        curl: R(curl.get()),
        sheet: s?.sheet,
        screenH: s?.screenH, top: s ? R(s.union.top, 1) : null, bottom: s ? R(s.union.bottom, 1) : null,
        stripRotX: s?.strips.map((x) => x.rotX),
        stripDelta: s?.strips.map((x) => x.delta),
        kinds: s ? Array.from(new Set(s.strips.map((x) => x.kind))) : null,
      });
    }
    flapRot.set(orig);
    setBusy(false);
    emit({ ...full(), sweep: steps, hint: 'screenH = chiều cao nắp trên màn hình theo góc; nếu 3D đúng, screenH sẽ KHÔNG chỉ co theo cos(góc)' }, 'sweep');
  };

  const doTimeline = () => emit({ ...full(), timeline: timeline.current, events: dbgLog.slice(-120) }, 'timeline');

  const doDownload = () => {
    const blob = new Blob([out || JSON.stringify(full(), null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `flap-debug-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  if (!on || typeof document === 'undefined') return null;

  const box: CSSProperties = {
    position: 'fixed', right: 8, bottom: 8, zIndex: 2147483000, width: open ? 360 : 'auto', maxHeight: '88vh', overflow: 'auto',
    background: 'rgb(18 18 22 / .94)', color: '#e8e8ee', font: '11px/1.4 ui-monospace, Menlo, Consolas, monospace',
    border: '1px solid #444', borderRadius: 8, padding: 8, pointerEvents: 'auto', textAlign: 'left',
  };
  const btn: CSSProperties = { background: '#2d6cdf', color: '#fff', border: 0, borderRadius: 4, padding: '4px 8px', cursor: 'pointer', font: 'inherit' };
  const row: CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, margin: '3px 0' };
  const set = <K extends keyof typeof DEF>(k: K, v: (typeof DEF)[K]) => setTune((p) => ({ ...p, [k]: v }));

  return createPortal(
    <div style={box} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      <div style={{ ...row, justifyContent: 'space-between' }}>
        <b>🐞 flap debug</b>
        <span>
          <button style={{ ...btn, background: '#555' }} onClick={() => setOpen((v) => !v)}>{open ? 'Thu gọn' : 'Mở'}</button>{' '}
          <button style={{ ...btn, background: '#8a3030' }} onClick={() => { setDbgOn(false); setOn(false); }}>Tắt</button>
        </span>
      </div>
      {open && (
        <>
          <div style={{ whiteSpace: 'pre', opacity: .9 }}>
            {Object.entries(hud).map(([k, v]) => `${k.padEnd(12)} ${v}`).join('\n')}
          </div>

          <hr style={{ borderColor: '#333', margin: '6px 0' }} />
          <b>Thử nghiệm trực tiếp (nhìn xem cái nào làm nắp "3D" hơn)</b>
          <label style={row}>
            <input type="checkbox" checked={scrub} onChange={(e) => setScrub(e.target.checked)} /> kéo tay góc nắp
            <input type="range" min={0} max={180} step={1} disabled={!scrub} defaultValue={0} style={{ flex: 1 }}
              onChange={(e) => flapRot.set(Number(e.target.value))} />
          </label>
          <label style={row}>perspective {tune.persp}px
            <input type="range" min={300} max={3000} step={50} value={tune.persp} style={{ flex: 1 }} onChange={(e) => set('persp', Number(e.target.value))} />
          </label>
          <label style={row}>
            <input type="checkbox" checked={tune.originOn} onChange={(e) => set('originOn', e.target.checked)} /> ép tâm phối cảnh, hạ {tune.drop}px
            <input type="range" min={-300} max={900} step={20} value={tune.drop} style={{ flex: 1 }} onChange={(e) => set('drop', Number(e.target.value))} />
          </label>
          <label style={row}>nghiêng phong bì {tune.tilt}°
            <input type="range" min={-35} max={35} step={1} value={tune.tilt} style={{ flex: 1 }} onChange={(e) => set('tilt', Number(e.target.value))} />
          </label>
          <label style={row}><input type="checkbox" checked={tune.noclip} onChange={(e) => set('noclip', e.target.checked)} /> tắt clip-path các dải</label>
          <label style={row}><input type="checkbox" checked={tune.noshade} onChange={(e) => set('noshade', e.target.checked)} /> tắt đổ bóng theo góc</label>
          <label style={row}><input type="checkbox" checked={tune.outline} onChange={(e) => set('outline', e.target.checked)} /> viền đỏ từng dải (thấy bản lề)</label>
          <button style={{ ...btn, background: '#555' }} onClick={() => setTune(DEF)}>Reset thử nghiệm</button>

          <hr style={{ borderColor: '#333', margin: '6px 0' }} />
          <b>Lấy log (tự copy vào clipboard)</b>
          <div style={{ ...row, flexWrap: 'wrap' }}>
            <button style={btn} onClick={doSnapshot} disabled={busy}>1. Snapshot</button>
            <button style={btn} onClick={doSweep} disabled={busy}>2. Quét góc 0→180</button>
            <button style={btn} onClick={doTimeline} disabled={busy}>3. Timeline + sự kiện</button>
            <button style={{ ...btn, background: '#555' }} onClick={doDownload}>Tải .json</button>
          </div>
          <div style={{ opacity: .7 }}>Gợi ý: bấm mở/đóng nắp 1 lần, rồi bấm 3. Sau đó gửi log (dán hoặc tải file). Nếu clipboard bị chặn, copy từ ô dưới.</div>
          <textarea readOnly value={out} onFocus={(e) => e.currentTarget.select()}
            style={{ width: '100%', height: 90, marginTop: 4, background: '#0c0c10', color: '#9fe', font: 'inherit', border: '1px solid #333' }} />
        </>
      )}
    </div>,
    document.body,
  );
}
