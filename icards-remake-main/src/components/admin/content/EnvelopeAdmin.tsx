"use client";

// Tab "Phong bì": quản lý danh mục phong bì và lớp lót, và chọn phong bì + lớp lót cho từng mẫu thiệp.
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  getAdminEnvelopePresets,
  getAdminTemplates,
  saveAdminEnvelopePresets,
  saveAdminTemplateEnvelope,
  type AdminTemplate,
  type EnvelopePresetItem,
  type EnvelopePresetsData,
  type LinerPresetItem,
} from "@/lib/api/admin";
import { ErrorBox, PageTitle, btnCls, btnGhostCls, errorMessage, inputCls } from "@/components/admin/ui";
import { Field } from "./forms";

const TONES = ["yellow", "purple", "red", "blue", "pink", "green", "neutral", "dark"];
const DEFAULT_LABEL = "Mặc định";

export default function EnvelopeAdmin() {
  const [presets, setPresets] = useState<EnvelopePresetsData>({ envelopes: [], liners: [] });
  const [savedPresets, setSavedPresets] = useState<EnvelopePresetsData>({ envelopes: [], liners: [] });
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  // Lựa chọn phong bì/lớp lót theo mẫu, chỉ ghi khi bấm "Lưu" của dòng đó
  const [pick, setPick] = useState<Record<string, { envId: string; linerId: string }>>({});
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [rowSaved, setRowSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const [p, t] = await Promise.all([getAdminEnvelopePresets(), getAdminTemplates()]);
      setPresets(p.data);
      setSavedPresets(p.data);
      setTemplates(t.data);
      setPick(Object.fromEntries(t.data.map((m) => [m._id, { envId: m.envelope?.envId ?? "", linerId: m.envelope?.linerId ?? "" }])));
    } catch (e) {
      setError(errorMessage(e, "Không tải được dữ liệu phong bì."));
    }
  };

  useEffect(() => {
    // Tải dữ liệu từ API khi vào trang: đồng bộ với hệ thống bên ngoài
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const setEnv = (i: number, patch: Partial<EnvelopePresetItem>) =>
    setPresets((p) => ({ ...p, envelopes: p.envelopes.map((e, k) => (k === i ? { ...e, ...patch } : e)) }));
  const setLiner = (i: number, patch: Partial<LinerPresetItem>) =>
    setPresets((p) => ({ ...p, liners: p.liners.map((l, k) => (k === i ? { ...l, ...patch } : l)) }));

  const savePresets = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const r = await saveAdminEnvelopePresets(presets);
      setPresets(r.data);
      setSavedPresets(r.data);
      setMessage("Đã lưu danh mục phong bì và lớp lót.");
    } catch (e) {
      setError(errorMessage(e, "Danh mục chưa hợp lệ, kiểm tra mã, màu và nền."));
    } finally {
      setBusy(false);
    }
  };

  const presetsDirty = JSON.stringify(presets) !== JSON.stringify(savedPresets);

  const saveRow = async (t: AdminTemplate) => {
    const v = pick[t._id] ?? { envId: "", linerId: "" };
    setRowBusy(t._id);
    setError("");
    try {
      await saveAdminTemplateEnvelope(t._id, { envId: v.envId || null, linerId: v.linerId || null });
      setRowSaved(t._id);
      setTemplates((rows) => rows.map((r) => (r._id === t._id ? { ...r, envelope: { envId: v.envId || undefined, linerId: v.linerId || undefined } } : r)));
      setTimeout(() => setRowSaved((cur) => (cur === t._id ? null : cur)), 1500);
    } catch (e) {
      setError(errorMessage(e, "Chưa gán được phong bì cho mẫu này."));
    } finally {
      setRowBusy(null);
    }
  };

  const envById = new Map(savedPresets.envelopes.map((e) => [e.id, e]));
  const linerById = new Map(savedPresets.liners.map((l) => [l.id, l]));

  return (
    <div>
      <PageTitle
        title="Phong bì"
        description="Quản lý danh mục phong bì và lớp lót mà studio cho chọn, rồi chọn phong bì mặc định cho từng mẫu thiệp."
      />
      {error && <ErrorBox>{error}</ErrorBox>}
      {message && <p className="mb-4 rounded-md bg-[#E7F5EC] px-4 py-3 text-sm text-[#1F7A3D]">{message}</p>}

      {/* Danh mục phong bì */}
      <section className="mb-8 rounded-md border border-[#D9E1EC] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Danh mục phong bì</h2>
          <button type="button" className={btnGhostCls} onClick={() => setPresets((p) => ({ ...p, envelopes: [...p.envelopes, { id: "", name: "", color: "#6E2B22", tone: "red" }] }))}>
            <Plus className="mr-1 size-3.5" aria-hidden /> Thêm phong bì
          </button>
        </div>
        <div className="space-y-2">
          {presets.envelopes.map((e, i) => (
            <div key={i} className="grid items-center gap-2 md:grid-cols-[48px_1fr_1fr_120px_120px_40px]">
              <span className="size-10 rounded-md ring-1 ring-black/10" style={{ background: e.color }} aria-hidden />
              <input className={inputCls} placeholder="Mã (vd: rose)" value={e.id} onChange={(ev) => setEnv(i, { id: ev.target.value.toLowerCase() })} aria-label="Mã phong bì" />
              <input className={inputCls} placeholder="Tên hiển thị" value={e.name} onChange={(ev) => setEnv(i, { name: ev.target.value })} aria-label="Tên phong bì" />
              <div className="flex items-center gap-2">
                <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(e.color) ? e.color : "#6e2b22"} onChange={(ev) => setEnv(i, { color: ev.target.value })} className="h-10 w-12 cursor-pointer rounded border border-[#C5D0DE] bg-white p-1" aria-label="Màu phong bì" />
                <input className={`${inputCls} w-full`} value={e.color} onChange={(ev) => setEnv(i, { color: ev.target.value })} aria-label="Mã màu" />
              </div>
              <select className={inputCls} value={e.tone} onChange={(ev) => setEnv(i, { tone: ev.target.value })} aria-label="Tông màu">
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button type="button" className="grid size-10 place-items-center rounded-md text-[#A33B3B] hover:bg-[#FBEAEA]" aria-label="Xóa phong bì" onClick={() => setPresets((p) => ({ ...p, envelopes: p.envelopes.filter((_, k) => k !== i) }))}>
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Lớp lót */}
      <section className="mb-8 rounded-md border border-[#D9E1EC] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Lớp lót</h2>
          <button type="button" className={btnGhostCls} onClick={() => setPresets((p) => ({ ...p, liners: [...p.liners, { id: "", name: "", background: "#1c1b1b", tone: "dark" }] }))}>
            <Plus className="mr-1 size-3.5" aria-hidden /> Thêm lớp lót
          </button>
        </div>
        <div className="space-y-2">
          {presets.liners.map((l, i) => (
            <div key={i} className="grid items-center gap-2 md:grid-cols-[48px_1fr_1fr_2fr_120px_40px]">
              <span className="size-10 rounded-md ring-1 ring-black/10" style={{ background: l.background }} aria-hidden />
              <input className={inputCls} placeholder="Mã (vd: gold-dots)" value={l.id} onChange={(ev) => setLiner(i, { id: ev.target.value.toLowerCase() })} aria-label="Mã lớp lót" />
              <input className={inputCls} placeholder="Tên hiển thị" value={l.name} onChange={(ev) => setLiner(i, { name: ev.target.value })} aria-label="Tên lớp lót" />
              <input className={inputCls} placeholder="Nền CSS (màu hoặc gradient)" value={l.background} onChange={(ev) => setLiner(i, { background: ev.target.value })} aria-label="Nền lớp lót" />
              <select className={inputCls} value={l.tone} onChange={(ev) => setLiner(i, { tone: ev.target.value })} aria-label="Tông màu lớp lót">
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button type="button" className="grid size-10 place-items-center rounded-md text-[#A33B3B] hover:bg-[#FBEAEA]" aria-label="Xóa lớp lót" onClick={() => setPresets((p) => ({ ...p, liners: p.liners.filter((_, k) => k !== i) }))}>
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="mb-10 flex items-center gap-3">
        <button type="button" className={btnCls} onClick={savePresets} disabled={busy || !presetsDirty}>
          {busy ? "Đang lưu…" : "Lưu danh mục"}
        </button>
        {presetsDirty && <span className="text-sm text-[#8A5A00]">Có thay đổi chưa lưu</span>}
      </div>

      {/* Gán cho từng mẫu */}
      <section className="rounded-md border border-[#D9E1EC] bg-white">
        <div className="border-b border-[#EEF2F7] px-5 py-4">
          <h2 className="text-base font-semibold">Phong bì cho từng mẫu</h2>
          <p className="mt-1 text-sm text-[#5B6B7F]">Mẫu nào cũng có sẵn phong bì này khi người dùng mở mẫu trong studio.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-[#F1F5FA] text-left text-xs uppercase tracking-wide text-[#5B6B7F]">
              <tr>
                <th className="px-4 py-3">Mẫu</th>
                <th className="px-4 py-3">Phong bì</th>
                <th className="px-4 py-3">Lớp lót</th>
                <th className="px-4 py-3 text-right">Lưu</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-[#5B6B7F]">Chưa có mẫu nào.</td></tr>}
              {templates.map((t) => {
                const v = pick[t._id] ?? { envId: "", linerId: "" };
                const env = envById.get(v.envId);
                const liner = linerById.get(v.linerId);
                const cur = t.envelope;
                const changed = (v.envId || undefined) !== (cur?.envId || undefined) || (v.linerId || undefined) !== (cur?.linerId || undefined);
                return (
                  <tr key={t._id} className="border-t border-[#EEF2F7]">
                    <td className="px-4 py-3">
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-[#5B6B7F]">{t.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="size-6 shrink-0 rounded ring-1 ring-black/10" style={{ background: env?.color ?? "transparent" }} aria-hidden />
                        <select className={inputCls} value={v.envId} onChange={(e) => setPick((p) => ({ ...p, [t._id]: { ...v, envId: e.target.value } }))} aria-label={`Phong bì của ${t.name}`}>
                          <option value="">{DEFAULT_LABEL}</option>
                          {savedPresets.envelopes.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="size-6 shrink-0 rounded ring-1 ring-black/10" style={{ background: liner?.background ?? "transparent" }} aria-hidden />
                        <select className={inputCls} value={v.linerId} onChange={(e) => setPick((p) => ({ ...p, [t._id]: { ...v, linerId: e.target.value } }))} aria-label={`Lớp lót của ${t.name}`}>
                          <option value="">{DEFAULT_LABEL}</option>
                          {savedPresets.liners.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {rowSaved === t._id
                        ? <span className="text-sm font-medium text-[#1F7A3D]">Đã lưu</span>
                        : <button type="button" className={btnGhostCls} disabled={!changed || rowBusy === t._id} onClick={() => saveRow(t)}>
                            {rowBusy === t._id ? "Đang lưu…" : "Lưu"}
                          </button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
