"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { invitationsApi } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { errorText } from "@/lib/invitation-flow";
import { useInvitation, btnDanger, card, input } from "./useInvitation";

export function DeletePanel({ id }: { id: string }) {
  const { inv, loading, error } = useInvitation(id);
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (loading) return <p className="text-sm text-muted">Đang tải…</p>;
  if (error || !inv) return <p role="alert" className="text-sm text-red-700">{error || "Không tìm thấy thiệp."}</p>;

  const canDelete = typed.trim() === inv.title;

  async function onDelete() {
    setBusy(true);
    try {
      await invitationsApi.deleteInvitation(id);
      router.replace(ROUTES.invitationManagement);
    } catch (err) {
      setMsg(errorText(err));
      setBusy(false);
    }
  }

  return (
    <div className={`${card} max-w-2xl space-y-4 border-red-200`}>
      <h2 className="text-lg font-bold text-red-700">Xoá thiệp mời</h2>
      <p className="text-sm text-ink">
        Xoá sẽ xoá vĩnh viễn thiệp, toàn bộ khách mời, nhóm khách và lời chúc. Link đã gửi cho khách sẽ không còn mở được.
      </p>
      <label className="block text-sm">
        Gõ đúng tên thiệp <strong>{inv.title}</strong> để xác nhận
        <input value={typed} onChange={(e) => setTyped(e.target.value)} className={`${input} mt-2`} />
      </label>
      {msg && <p role="alert" className="text-sm text-red-700">{msg}</p>}
      <button type="button" onClick={onDelete} disabled={!canDelete || busy} className={btnDanger}>
        {busy ? "Đang xoá…" : "Xoá thiệp này"}
      </button>
    </div>
  );
}
