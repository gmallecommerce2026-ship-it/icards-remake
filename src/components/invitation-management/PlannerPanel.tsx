"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { invitationsApi } from "@/lib/api";
import { errorText, type PlannerTask } from "@/lib/invitation-flow";
import { asList } from "./shared";
import { btnDanger, btnGhost, btnPrimary, card, input } from "./useInvitation";

const DEFAULT_CAT = "Chung";
const keyOf = (t: PlannerTask, i: number) => t._id ?? `new-${i}`;
const catOf = (t: PlannerTask) => t.category || DEFAULT_CAT;

/** Một dòng công việc có thể kéo để đổi thứ tự trong nhóm. */
function SortableTask({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-3 px-4 py-3">
      <button type="button" aria-label="Kéo để sắp xếp" className="cursor-grab touch-none text-muted" {...attributes} {...listeners}>⋮⋮</button>
      {children}
    </li>
  );
}

/** Kế hoạch cưới: công việc theo nhóm, kéo thả, tiến độ. */
export function PlannerPanel({ id }: { id: string }) {
  const [tasks, setTasks] = useState<PlannerTask[] | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [due, setDue] = useState("");
  const [editing, setEditing] = useState<{ key: string; title: string } | null>(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    let alive = true;
    invitationsApi.getTasks(id)
      .then((r) => { if (alive) setTasks(asList<PlannerTask>(r.data)); })
      .catch((err) => { if (alive) setMsg(errorText(err, "Không tải được công việc.")); });
    return () => { alive = false; };
  }, [id]);

  // Backend thay toàn bộ danh sách mỗi lần lưu
  async function save(next: PlannerTask[]) {
    const prev = tasks;
    setTasks(next);
    setSaving(true);
    setMsg("");
    try {
      const { data } = await invitationsApi.updateTasks(id, {
        tasks: next.map(({ _id, title, done, dueDate, category, note }) => ({ _id, title, done, dueDate, category, note })),
      });
      setTasks(asList<PlannerTask>(data));
    } catch (err) {
      setTasks(prev);
      setMsg(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  const list = tasks ?? [];
  const groups = useMemo(() => {
    const names: string[] = [];
    list.forEach((t) => { if (!names.includes(catOf(t))) names.push(catOf(t)); });
    return names;
  }, [list]);

  const done = list.filter((t) => t.done).length;
  const pct = list.length ? Math.round((done / list.length) * 100) : 0;

  function onDragEnd(cat: string, e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const idxs = list.map((t, i) => (catOf(t) === cat ? i : -1)).filter((i) => i >= 0);
    const ids = idxs.map((i) => keyOf(list[i], i));
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    const reordered = arrayMove(idxs.map((i) => list[i]), from, to);
    const next = [...list];
    idxs.forEach((pos, k) => { next[pos] = reordered[k]; });
    save(next);
  }

  function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    save([...list, { title: title.trim(), done: false, category: category.trim() || DEFAULT_CAT, dueDate: due || undefined }]);
    setTitle("");
  }

  const patch = (i: number, p: Partial<PlannerTask>) => save(list.map((t, j) => (j === i ? { ...t, ...p } : t)));
  const indexOfKey = (key: string) => list.findIndex((t, i) => keyOf(t, i) === key);

  return (
    <div className="flex flex-col gap-6">
      <section className={`${card} flex flex-col gap-3`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-semibold text-ink">Hành trình chuẩn bị</h3>
          <p className="text-sm text-muted"><span className="font-bold text-lacquer">{done}</span> / {list.length} công việc</p>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-lacquer-soft" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-lacquer transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-right text-sm font-semibold text-lacquer">{pct}%</p>
      </section>

      <form onSubmit={addTask} className="flex flex-wrap gap-2">
        <input className={`${input} max-w-[220px]`} list="planner-cats" placeholder="Nhóm (VD: Đặt tiệc)" value={category} onChange={(e) => setCategory(e.target.value)} />
        <datalist id="planner-cats">{groups.map((g) => <option key={g} value={g} />)}</datalist>
        <input className={`${input} min-w-[220px] flex-1`} placeholder="Công việc cần làm…" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="date" className={`${input} max-w-[170px]`} value={due} onChange={(e) => setDue(e.target.value)} aria-label="Hạn" />
        <button type="submit" className={btnPrimary} disabled={!title.trim() || saving}>Thêm</button>
      </form>

      {tasks === null && !msg && <p className="text-sm text-muted">Đang tải kế hoạch…</p>}

      {groups.map((cat) => {
        const idxs = list.map((t, i) => (catOf(t) === cat ? i : -1)).filter((i) => i >= 0);
        const ids = idxs.map((i) => keyOf(list[i], i));
        const catDone = idxs.filter((i) => list[i].done).length;
        return (
          <section key={cat} className={`${card} p-0`}>
            <header className="flex items-center justify-between border-b border-line bg-porcelain px-4 py-3">
              <h4 className="font-semibold text-lacquer">{cat} <span className="font-normal text-muted">({catDone}/{idxs.length})</span></h4>
            </header>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => onDragEnd(cat, e)}>
              <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                <ul className="divide-y divide-line">
                  {idxs.map((i) => {
                    const t = list[i];
                    const key = keyOf(t, i);
                    const isEdit = editing?.key === key;
                    return (
                      <SortableTask key={key} id={key}>
                        <input type="checkbox" checked={t.done} onChange={() => patch(i, { done: !t.done })} className="size-4" aria-label={`Hoàn thành: ${t.title}`} />
                        {isEdit ? (
                          <input autoFocus className={`${input} flex-1`} value={editing.title}
                            onChange={(e) => setEditing({ key, title: e.target.value })}
                            onBlur={() => { if (editing.title.trim()) patch(i, { title: editing.title.trim() }); setEditing(null); }}
                            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") setEditing(null); }} />
                        ) : (
                          <button type="button" onClick={() => setEditing({ key, title: t.title })}
                            className={`flex-1 text-left ${t.done ? "text-muted line-through" : "text-ink"}`}>{t.title}</button>
                        )}
                        {t.dueDate && <span className="hidden text-xs text-muted sm:inline">{new Date(t.dueDate).toLocaleDateString("vi-VN")}</span>}
                        <select aria-label="Chuyển nhóm" className={`${input} h-8 w-auto max-w-[140px] text-xs`} value={cat}
                          onChange={(e) => patch(i, { category: e.target.value })}>
                          {groups.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <button type="button" className={btnDanger} onClick={() => save(list.filter((_, j) => j !== i))}>Xoá</button>
                      </SortableTask>
                    );
                  })}
                  {idxs.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">Chưa có công việc.</li>}
                </ul>
              </SortableContext>
            </DndContext>
          </section>
        );
      })}

      {tasks !== null && list.length === 0 && <div className={`${card} text-center text-muted`}>Chưa có kế hoạch nào. Thêm công việc đầu tiên ở trên.</div>}
      {msg && <p role="alert" className="text-sm text-red-700">{msg}</p>}
    </div>
  );
}
