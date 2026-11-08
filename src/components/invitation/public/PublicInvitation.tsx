"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { invitationsApi, wishesApi } from "@/lib/api";
import { errorText, formatEventDate } from "@/lib/invitation-flow";
import { EVENT_FONT_VARS, EventDetailsEditor } from "@/components/invitation-send/EventDetailsEditor";
import { PublicEnvelopeIntro } from "./PublicEnvelopeIntro";

type Guest = { name: string; status: "pending" | "attending" | "declined"; companions: number } | null;
type Settings = { allowRsvp: boolean; allowWishes: boolean; moderateWishes?: boolean; maxCompanions: number; rsvpDeadline?: string | null };
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

/* Cùng bảng màu mặc định với EventDetailsEditor, để phần xác nhận và lưu bút
   liền mạch với nội dung thiệp phía trên (cùng nền, cùng chữ, cùng màu nhấn). */
const THEME = {
  "--ev-accent": "#2F4C8F",
  "--ev-bg": "#FFFCF6",
  "--ev-ink": "#1D1B2A",
  "--ev-on-accent": "#FFFFFF",
} as CSSProperties;

const LABEL: CSSProperties = {
  fontFamily: "var(--ev-sans), sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  opacity: 0.65,
};
const TITLE: CSSProperties = { fontFamily: "var(--ev-serif), serif", fontWeight: 500, fontSize: "clamp(1.7rem,4.5vw,2.4rem)", lineHeight: 1.15 };
const FIELD: CSSProperties = { borderBottom: "1px dotted var(--ev-accent)", background: "transparent", font: "inherit", color: "inherit" };
const BOX: CSSProperties = { border: "1px solid rgba(29,27,42,.15)", background: "transparent", font: "inherit", color: "inherit" };
const PILL: CSSProperties = {
  background: "var(--ev-accent)",
  color: "var(--ev-on-accent)",
  border: "1px solid var(--ev-accent)",
  fontFamily: "var(--ev-sans), sans-serif",
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

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
      <PublicEnvelopeIntro info={eventInfo} />

      {/* Toàn bộ phần dưới dùng CHUNG một nền + một bộ font/màu, nên nội dung thiệp và phần xác nhận liền mạch */}
      <div className={`${EVENT_FONT_VARS} min-h-dvh`} style={{ ...THEME, background: "var(--ev-bg)", color: "var(--ev-ink)" }}>
        <EventDetailsEditor readOnly initial={eventInfo} defaultShowRsvp={false} defaultShowGuests={false} />

        <main className="mx-auto max-w-xl px-5 pb-28 text-center" style={{ fontFamily: "var(--ev-sans), system-ui, sans-serif" }}>
          {inv.guest && (
            <p className="mb-2" style={{ fontFamily: "var(--ev-serif), serif", fontSize: "1.25rem" }}>
              Kính mời <strong style={{ fontWeight: 600 }}>{inv.guest.name}</strong>
            </p>
          )}

          {inv.guest && (
            <section className="mt-16" aria-labelledby="rsvp-title">
              <h2 id="rsvp-title" style={LABEL}>Xác nhận tham dự</h2>
              <div className="mt-3" style={TITLE}>Bạn có đến được không?</div>

              {!inv.settings.allowRsvp || deadlinePassed ? (
                <p className="mt-6 opacity-70">Đã hết hạn xác nhận tham dự.</p>
              ) : canRsvp ? (
                <form onSubmit={onRsvp} className="mx-auto mt-8 max-w-sm space-y-6 text-left">
                  <fieldset className="flex justify-center gap-6">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="status" value="attending" defaultChecked={inv.guest.status !== "declined"} style={{ accentColor: "var(--ev-accent)" }} />
                      Tôi sẽ đến
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="status" value="declined" defaultChecked={inv.guest.status === "declined"} style={{ accentColor: "var(--ev-accent)" }} />
                      Không đến được
                    </label>
                  </fieldset>
                  <label className="block text-sm">
                    <span style={LABEL}>Số người đi cùng (tối đa {inv.settings.maxCompanions})</span>
                    <input name="companions" type="number" min={0} max={inv.settings.maxCompanions} defaultValue={inv.guest.companions} className="mt-2 block w-32 bg-transparent py-2 outline-none" style={FIELD} />
                  </label>
                  <label className="block text-sm">
                    <span style={LABEL}>Lời nhắn (không bắt buộc)</span>
                    <textarea name="message" rows={2} maxLength={500} className="mt-2 w-full rounded-sm p-3 outline-none" style={BOX} />
                  </label>
                  <div className="text-center">
                    <button type="submit" disabled={busy} className="rounded-full px-8 py-3 text-xs disabled:opacity-60" style={PILL}>
                      Gửi xác nhận
                    </button>
                  </div>
                  {rsvpMsg && <p role="status" className="text-center text-sm" style={{ color: "var(--ev-accent)" }}>{rsvpMsg}</p>}
                </form>
              ) : (
                <p className="mt-6 opacity-75">
                  Bạn đã xác nhận: {inv.guest.status === "attending" ? "sẽ tham dự" : inv.guest.status === "declined" ? "không tham dự" : "chưa trả lời"}.
                </p>
              )}
            </section>
          )}

          <section className="mt-20" aria-labelledby="wish-title">
            <h2 id="wish-title" style={LABEL}>Sổ lưu bút</h2>
            <div className="mt-3" style={TITLE}>Gửi lời chúc tới hai bạn</div>

            {inv.settings.allowWishes ? (
              <form onSubmit={onWish} className="mx-auto mt-8 max-w-sm space-y-4 text-left">
                <input name="name" required maxLength={80} defaultValue={inv.guest?.name ?? ""} placeholder="Tên của bạn" className="block w-full bg-transparent py-2 text-center outline-none placeholder:opacity-40" style={FIELD} />
                <textarea name="message" required maxLength={1000} rows={3} placeholder="Gửi lời chúc" className="w-full rounded-sm p-3 outline-none placeholder:opacity-40" style={BOX} />
                <div className="text-center">
                  <button type="submit" disabled={busy} className="rounded-full px-8 py-3 text-xs disabled:opacity-60" style={PILL}>
                    Gửi lời chúc
                  </button>
                </div>
                {wishMsg && <p role="status" className="text-center text-sm" style={{ color: "var(--ev-accent)" }}>{wishMsg}</p>}
              </form>
            ) : (
              <p className="mt-6 opacity-70">Chủ thiệp đã tắt sổ lưu bút.</p>
            )}

            <ul className="mt-10 space-y-6">
              {wishes.map((w) => (
                <li key={w._id} className="border-t border-dotted pt-5" style={{ borderColor: "var(--ev-accent)" }}>
                  <p style={{ fontWeight: 600 }}>{w.name}</p>
                  <p className="mt-1 whitespace-pre-wrap italic opacity-80" style={{ fontFamily: "var(--ev-serif), serif", fontSize: "1.1rem" }}>{w.message}</p>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </>
  );
}
