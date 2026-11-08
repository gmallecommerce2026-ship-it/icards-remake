"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { invitationsApi, wishesApi } from "@/lib/api";
import { errorText, formatEventDate } from "@/lib/invitation-flow";
import { EventDetailsEditor } from "@/components/invitation-send/EventDetailsEditor";
import { PublicEnvelopeIntro } from "./PublicEnvelopeIntro";

type Guest = { name: string; status: "pending" | "attending" | "declined"; companions: number } | null;
type Settings = { allowRsvp: boolean; allowWishes: boolean; maxCompanions: number; rsvpDeadline?: string | null };
type PublicInv = {
  _id: string;
  slug: string;
  title: string;
  eventDate?: string | null;
  cover?: string | null;
  info?: { title?: string; description?: string; host?: string; date?: string; time?: string; venue?: string; address?: string };
  settings: Settings;
  guest: Guest;
};
type Wish = { _id: string; name: string; message: string };

const input = "h-11 w-full rounded-lg border border-[#C5D0DE] bg-white px-3 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-[#27548A]/30";

export function PublicInvitation() {
  const sp = useSearchParams();
  const id = sp.get("id") ?? "";
  const guestId = sp.get("guestId") ?? undefined;
  const [inv, setInv] = useState<PublicInv | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [rsvpMsg, setRsvpMsg] = useState("");
  const [wishMsg, setWishMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) { setState("missing"); return; }
    let alive = true;
    invitationsApi.getPublicInvitation(id, { guestId })
      .then((r) => { if (alive) { setInv(r.data as PublicInv); setState("ready"); } })
      .catch(() => { if (alive) setState("missing"); });
    wishesApi.getPublicWishes(id).then((r) => { if (alive) setWishes(r.data.items ?? r.data ?? []); }).catch(() => {});
    return () => { alive = false; };
  }, [id, guestId]);

  if (state === "loading") return <main className="grid min-h-[60vh] place-items-center text-muted">Đang mở thiệp…</main>;
  if (state === "missing" || !inv) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-[#0E1B2C]">Không tìm thấy thiệp</h1>
        <p className="mt-2 text-[#5B6B7F]">Link có thể đã sai hoặc thiệp chưa được công khai. Hãy liên hệ người gửi thiệp cho bạn.</p>
      </main>
    );
  }

  const info = inv.info ?? {};
  const deadlinePassed = !!inv.settings.rsvpDeadline && new Date(inv.settings.rsvpDeadline) < new Date();
  const canRsvp = inv.settings.allowRsvp && !!guestId && !!inv.guest && !deadlinePassed;
  // nội dung thiệp hiển thị y như phần dưới của luồng gửi thiệp trong studio
  const eventInfo = {
    title: info.title || inv.title,
    description: info.description ?? "",
    host: info.host ?? "",
    date: info.date || formatEventDate(inv.eventDate),
    time: info.time ?? "",
    venue: info.venue ?? "",
    address: info.address ?? "",
  };

  async function onRsvp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!guestId) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setRsvpMsg("");
    try {
      const status = f.get("status") === "declined" ? "declined" : "attending";
      const companions = Math.min(inv!.settings.maxCompanions, Math.max(0, Number(f.get("companions") ?? 0)));
      const { data } = await invitationsApi.submitRsvp(inv!.slug, guestId, { status, companions, message: String(f.get("message") ?? "") || undefined });
      setInv({ ...inv!, guest: { name: data.name, status: data.status, companions: data.companions } });
      setRsvpMsg("Cảm ơn bạn đã xác nhận.");
    } catch (err) {
      setRsvpMsg(errorText(err, "Không gửi được xác nhận."));
    } finally {
      setBusy(false);
    }
  }

  async function onWish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setWishMsg("");
    try {
      await wishesApi.createPublicWish(inv!.slug, { name: String(f.get("name") ?? ""), message: String(f.get("message") ?? ""), guestId });
      e.currentTarget.reset();
      setWishMsg(inv!.settings.moderateWishes ? "Cảm ơn bạn! Lời chúc sẽ hiện sau khi chủ thiệp duyệt." : "Cảm ơn bạn đã gửi lời chúc.");
    } catch (err) {
      setWishMsg(errorText(err, "Không gửi được lời chúc."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PublicEnvelopeIntro />
      <section className="bg-white">
        <EventDetailsEditor readOnly initial={eventInfo} defaultShowRsvp={false} defaultShowGuests={false} />
      </section>

      <main className="mx-auto max-w-xl px-5 py-12 text-[#0E1B2C]">
        {inv.guest && <p className="mb-2 text-lg">Kính mời <strong>{inv.guest.name}</strong></p>}

      {inv.guest && (
        <section className="mt-10" aria-labelledby="rsvp-title">
          <h2 id="rsvp-title" className="text-xl font-bold">Xác nhận tham dự</h2>
          {!inv.settings.allowRsvp || deadlinePassed ? (
            <p className="mt-2 text-[#5B6B7F]">Đã hết hạn xác nhận tham dự.</p>
          ) : canRsvp ? (
            <form onSubmit={onRsvp} className="mt-4 space-y-4">
              <fieldset className="flex gap-6">
                <label className="flex items-center gap-2"><input type="radio" name="status" value="attending" defaultChecked={inv.guest.status !== "declined"} /> Tôi sẽ đến</label>
                <label className="flex items-center gap-2"><input type="radio" name="status" value="declined" defaultChecked={inv.guest.status === "declined"} /> Rất tiếc, không đến được</label>
              </fieldset>
              <label className="block text-sm font-medium">
                Số người đi cùng (tối đa {inv.settings.maxCompanions})
                <input name="companions" type="number" min={0} max={inv.settings.maxCompanions} defaultValue={inv.guest.companions} className={`${input} mt-1 w-32`} />
              </label>
              <label className="block text-sm font-medium">
                Lời nhắn (không bắt buộc)
                <textarea name="message" rows={2} maxLength={500} className="mt-1 w-full rounded-lg border border-[#C5D0DE] p-3" />
              </label>
              <button type="submit" disabled={busy} className="h-12 w-full rounded-lg bg-[#27548A] font-semibold text-white disabled:opacity-60">Gửi xác nhận</button>
              {rsvpMsg && <p role="status" className="text-sm text-[#1D5B35]">{rsvpMsg}</p>}
            </form>
          ) : (
            <p className="mt-2 text-[#5B6B7F]">Bạn đã xác nhận: {inv.guest.status === "attending" ? "sẽ tham dự" : inv.guest.status === "declined" ? "không tham dự" : "chưa trả lời"}.</p>
          )}
        </section>
      )}

      <section className="mt-12" aria-labelledby="wish-title">
        <h2 id="wish-title" className="text-xl font-bold">Sổ lưu bút</h2>
        {inv.settings.allowWishes ? (
          <form onSubmit={onWish} className="mt-4 space-y-3">
            <input name="name" required maxLength={80} defaultValue={inv.guest?.name ?? ""} placeholder="Tên của bạn" className={input} />
            <textarea name="message" required maxLength={1000} rows={3} placeholder="Gửi lời chúc" className="w-full rounded-lg border border-[#C5D0DE] p-3" />
            <button type="submit" disabled={busy} className="h-11 rounded-lg bg-[#27548A] px-6 font-semibold text-white disabled:opacity-60">Gửi lời chúc</button>
            {wishMsg && <p role="status" className="text-sm text-[#1D5B35]">{wishMsg}</p>}
          </form>
        ) : (
          <p className="mt-2 text-[#5B6B7F]">Chủ thiệp đã tắt sổ lưu bút.</p>
        )}
        <ul className="mt-6 space-y-4">
          {wishes.map((w) => (
            <li key={w._id} className="rounded-xl bg-white p-4">
              <p className="font-semibold">{w.name}</p>
              <p className="mt-1 whitespace-pre-wrap text-[#3D4C61]">{w.message}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
    </>
  );
}
