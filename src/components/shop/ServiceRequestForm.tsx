"use client";

import { useState, type FormEvent } from "react";
import { SERVICE_REQUEST_ENDPOINT } from "@/lib/services";

type Status = "idle" | "sending" | "done" | "error";

const PHONE_RE = /^(?:0|\+84|84)\d{9}$/;
const field =
  "mt-1.5 w-full rounded-lg border border-[#C5D0DE] bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#27548A]";

export function ServiceRequestForm({ serviceSlug, serviceName }: { serviceSlug: string; serviceName: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [phoneError, setPhoneError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const phone = String(data.get("phone") ?? "").replace(/[\s.\-]/g, "");
    if (!PHONE_RE.test(phone)) {
      setPhoneError("Số điện thoại chưa đúng. Ví dụ: 0912 345 678");
      return;
    }
    setPhoneError("");
    setStatus("sending");
    try {
      const res = await fetch(SERVICE_REQUEST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: serviceSlug,
          name: String(data.get("name") ?? "").trim(),
          phone,
          eventDate: String(data.get("eventDate") ?? ""),
          note: String(data.get("note") ?? "").trim(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="rounded-xl border border-[#BFE0CC] bg-[#EAF4EE] p-6 text-[#1D5B35]">
        <p className="font-semibold">Đã nhận yêu cầu</p>
        <p className="mt-1 text-sm">Chúng tôi sẽ liên hệ bạn trong giờ làm việc để báo giá {serviceName.toLowerCase()}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-xl border border-[#DDE4EE] bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Gửi yêu cầu báo giá</h2>
      <div className="mt-4 space-y-4">
        <label className="block text-sm font-medium">
          Họ và tên
          <input name="name" required autoComplete="name" maxLength={80} className={`${field} h-11`} />
        </label>
        <label className="block text-sm font-medium">
          Số điện thoại
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            aria-invalid={!!phoneError}
            aria-describedby={phoneError ? "phone-err" : undefined}
            className={`${field} h-11`}
          />
          {phoneError && <span id="phone-err" className="mt-1 block text-sm font-normal text-[#B3261E]">{phoneError}</span>}
        </label>
        <label className="block text-sm font-medium">
          Ngày tổ chức <span className="font-normal text-[#5B6B7F]">(nếu có)</span>
          <input name="eventDate" type="date" className={`${field} h-11`} />
        </label>
        <label className="block text-sm font-medium">
          Ghi chú
          <textarea name="note" rows={3} maxLength={500} className={`${field} py-2`} />
        </label>
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 h-12 w-full rounded-lg bg-[#27548A] font-semibold text-white transition-colors hover:bg-[#1F4573] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27548A]"
      >
        {status === "sending" ? "Đang gửi…" : "Gửi yêu cầu"}
      </button>
      <p role="alert" className="mt-3 min-h-5 text-sm text-[#B3261E]">
        {status === "error" && "Chưa gửi được. Vui lòng thử lại hoặc liên hệ qua trang Liên hệ."}
      </p>
    </form>
  );
}
