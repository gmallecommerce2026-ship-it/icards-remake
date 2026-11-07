"use client";

import { useEffect, useState } from "react";
import { invitationsApi } from "@/lib/api";
import { errorText, type PlannerTask } from "@/lib/invitation-flow";
import { btnDanger, btnGhost, btnPrimary, card, input } from "./useInvitation";

export function PlannerPanel({ id }: { id: string }) {
  const [tasks, setTasks] = useState<PlannerTask[] | null>(null);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    invitationsApi.getTasks(id)
      .then((r) => { if (alive) setTasks(r.data as PlannerTask[]); })
      .catch((err) => { if (alive) setMsg(errorText(err, "Không tải được công việc.")); });
    return () => { alive = false; };
  }, [id]);

  // Backend thay toàn bộ danh sách mỗi lần lưu, nên mọi thay đổi đi qua hàm này
  async function save(next: PlannerTask[]) {
    setSaving(true);
    setMsg("");
    try {
      const { data } = await invitationsApi.updateTasks(id, { tasks: next.map(({ _id, title, done, dueDate, category, note }) => ({ _id, title, done, dueDate, category, note })) });
      setTasks(data as PlannerTask[]);
    } catch (err) {
      setMsg(errorText(err));
    } finally {
      setSaving(false);
    }
  }

  if (!tasks) return <p className="text-sm text-muted">{msg || "Đang tải…"}</p>;

  const done = tasks.filter((t) => t.done).length;
  const add = () => {
    if (!title.trim()) return;
    save([...tasks, { title: title.trim(), done: false, dueDate: due ? new Date(due).toISOString() : undefined }]);
    setTitle("");
    setDue("");
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">Đã xong {done} / {tasks.length} công việc</p>
      <div className="flex flex-wrap gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Việc cần làm, ví dụ: Đặt địa điểm" className={`${input} max-w-sm`} />
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={`${input} w-auto`} />
        <button type="button" onClick={add} disabled={saving || !title.trim()} className={btnPrimary}>Thêm</button>
      </div>
      {msg && <p role="alert" className="text-sm text-red-700">{msg}</p>}
      <ul className="space-y-2">
        {tasks.map((t, i) => (
          <li key={t._id ?? i} className={`${card} flex flex-wrap items-center gap-3 p-3`}>
            <input type="checkbox" checked={t.done} onChange={() => save(tasks.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))} aria-label={`Hoàn thành ${t.title}`} />
            <span className={`flex-1 text-sm ${t.done ? "text-muted line-through" : "text-ink"}`}>{t.title}</span>
            {t.dueDate && <span className="text-xs text-muted">Hạn {new Date(t.dueDate).toLocaleDateString("vi-VN")}</span>}
            <button type="button" onClick={() => save(tasks.filter((_, j) => j !== i))} className={btnDanger}>Xoá</button>
          </li>
        ))}
      </ul>
      {tasks.length > 0 && <button type="button" className={btnGhost} onClick={() => save(tasks.map((t) => ({ ...t, done: false })))}>Bỏ đánh dấu tất cả</button>}
    </div>
  );
}
