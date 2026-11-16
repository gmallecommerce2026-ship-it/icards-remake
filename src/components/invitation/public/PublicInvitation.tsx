"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { invitationsApi, wishesApi } from "@/lib/api";
import { errorText, formatEventDate } from "@/lib/invitation-flow";
import { asList } from "@/components/invitation-management/shared";
import { EVENT_FONT_VARS, EventDetailsEditor, buttonStyle, getPageStyle, labelStyle, normalizePage, pageTheme } from "@/components/invitation-send/EventDetailsEditor";
import { PublicEnvelopeIntro, type PublicDesign } from "./PublicEnvelopeIntro";
import { GoogleCalendarCard } from "./GoogleCalendarCard";

type Guest = { name: string; status: "pending" | "attending" | "declined"; companions: number } | null;
type Settings = { allowRsvp: boolean; allowWishes: boolean; moderateWishes?: boolean; showGuestList?: boolean; maxCompanions: number; rsvpDeadline?: string | null };
type PublicInv = {
  _id: string;
  slug: string;
  title: string;
  eventType?: "wedding" | "birthday" | "baby" | "event";
  eventDate?: string | null;
  cover?: string | null;
  /** cấu hình trang studio đã lưu: { styleId, accent, bg, blocks } */
  page?: unknown;
  /** chỉ có khi chủ thiệp bật "Hiện danh sách khách mời" */
  guests?: { attending: string[]; pending: string[] } | null;
  info?: { title?: string; description?: string; host?: string; date?: string; time?: string; venue?: string; address?: string };
  settings: Settings;
  guest: Guest;
  design?: PublicDesign;
};
type Wish = { _id: string; name: string; message: string };

/* Lời kêu gọi gửi lưu bút theo loại sự kiện (trước đây cứng "hai bạn" của đám cưới) */
const WISH_HEADING: Record<string, string> = {
  wedding: "Gửi lời chúc tới hai bạn",
  birthday: "Gửi lời chúc tới chủ nhân bữa tiệc",
  baby: "Gửi lời chúc tới bé và gia đình",
  event: "Gửi lời nhắn tới ban tổ chức",
};

const FIELD: CSSProperties = { borderBottom: "1px dotted var(--ev-accent)", background: "transparent", font: "inherit", color: "inherit" };
const BOX: CSSProperties = { border: "1px solid color-mix(in srgb, var(--ev-ink) 25%, transparent)", background: "transparent", font: "inherit", color: "inherit" };

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
    wishesApi.getPublicWishes(id).then((r) => { if (alive) setWishes(asList<Wish>(r.data)); }).catch(() => {});
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
  // cùng kiểu trang + màu với phần cấu hình trong studio (đọc từ inv.page, không còn dùng màu cứng)
  const pg = normalizePage(inv.page);
  const st = getPageStyle(pg.styleId);
  const theme = pageTheme(pg.accent, pg.bg);
  const TITLE: CSSProperties = {
    fontFamily: st.font, fontWeight: st.weight, fontStyle: st.titleItalic ? "italic" : "normal", letterSpacing: st.tracking,
    textTransform: st.upper ? "uppercase" : "none", color: st.titleColor === "accent" ? "var(--ev-accent)" : undefined,
    fontSize: "clamp(1.7rem,4.5vw,2.4rem)", lineHeight: 1.2,
  };
  const LABEL = labelStyle(st);
  // nút xác nhận / gửi lời chúc cùng kiểu với nút của trang (vuông, bo tròn, viền, nền mờ...)
  const PILL: CSSProperties = { ...buttonStyle(st), fontFamily: "var(--ev-sans), sans-serif", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" };
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
    // React nulls e.currentTarget sau khi handler chạy xong -> phải giữ lại form TRƯỚC mọi `await`.
    // (Trước đây gọi e.currentTarget.reset() sau await => TypeError => báo "Không gửi được" dù lời chúc đã lưu.)
    const form = e.currentTarget;
    const f = new FormData(form);
    const name = String(f.get("name") ?? "").trim();
    const message = String(f.get("message") ?? "").trim();
    if (!name || !message) { setWishMsg("Vui lòng nhập tên và lời chúc."); return; }
    setBusy(true);
    setWishMsg("");
    try {
      await wishesApi.createPublicWish(inv!.slug, { name, message, guestId });
    } catch (err) {
      setWishMsg(errorText(err, "Không gửi được lời chúc. Vui lòng thử lại."));
      setBusy(false);
      return;
    }
    // Từ đây lời chúc đã được lưu; các bước hiển thị phụ không được làm hỏng thông báo thành công.
    form.reset();
    setWishMsg(inv!.settings.moderateWishes ? "Cảm ơn bạn! Lời chúc sẽ hiện sau khi chủ thiệp duyệt." : "Cảm ơn bạn đã gửi lời chúc.");
    try {
      const r = await wishesApi.getPublicWishes(inv!.slug);
      setWishes(asList<Wish>(r.data));
    } catch { /* bỏ qua: danh sách sẽ tải lại ở lần mở sau */ }
    setBusy(false);
  }

  return (
    <>
      <PublicEnvelopeIntro info={eventInfo} design={inv.design} guestName={inv.guest?.name} />

      {/* Toàn bộ phần dưới dùng CHUNG một nền + một bộ font/màu, nên nội dung thiệp và phần xác nhận liền mạch */}
      <div className={`${EVENT_FONT_VARS} min-h-dvh`} style={{ ...theme, background: "var(--ev-bg)", color: "var(--ev-ink)" }}>
        {/* nút "Sẽ tham dự / Không tham dự" trong khối này chỉ là hình minh hoạ; biểu mẫu xác nhận thật nằm ngay bên dưới */}
        <EventDetailsEditor
          readOnly
          initial={eventInfo}
          initialPage={inv.page}
          initialSettings={{ showRsvp: false, showGuests: !!inv.settings.showGuestList }}
          guests={inv.guests ?? undefined}
        />

        {/* Nhắc lịch: khối riêng, tách hẳn khỏi nội dung thiệp và phần cài đặt sự kiện */}
        <GoogleCalendarCard
          labelStyle={LABEL}
          buttonStyle={buttonStyle(st)}
          input={{
            title: eventInfo.title,
            eventDate: inv.eventDate,
            dateText: info.date,
            timeText: info.time,
            venue: info.venue,
            address: info.address,
            host: info.host,
            pageUrl: typeof window !== "undefined" ? window.location.href : "",
          }}
        />

        <main className="mx-auto max-w-xl px-5 pb-28 text-center" style={{ fontFamily: "var(--ev-sans), system-ui, sans-serif" }}>
          {inv.guest && (
            <p className="mb-2" style={{ fontFamily: "var(--ev-serif), serif", fontSize: "1.25rem" }}>
              Kính mời <strong style={{ fontWeight: 600 }}>{inv.guest.name}</strong>
            </p>
          )}

          {inv.guest && inv.settings.allowRsvp && (
            <section className="mt-16" aria-labelledby="rsvp-title">
              <h2 id="rsvp-title" style={LABEL}>Xác nhận tham dự</h2>
              <div className="mt-3" style={TITLE}>Bạn có đến được không?</div>

              {deadlinePassed ? (
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
            <div className="mt-3" style={TITLE}>{WISH_HEADING[inv.eventType ?? "wedding"] ?? WISH_HEADING.event}</div>

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
