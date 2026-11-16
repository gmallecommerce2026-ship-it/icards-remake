"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { forgotPassword } from "@/lib/api/auth";
import { errorText } from "@/lib/invitation-flow";

const field = "mt-1 h-11 w-full rounded-lg border border-[#C5D0DE] bg-white px-3 text-[15px] outline-none focus-visible:border-[#27548A] focus-visible:ring-2 focus-visible:ring-[#27548A]/20";

export function ForgotPasswordForm() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setBusy(true);
    setError("");
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(errorText(err, "Không gửi được yêu cầu, vui lòng thử lại."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16 pt-[96px]">
      <h1 className="text-3xl font-bold tracking-tight text-[#0E1B2C]">Quên mật khẩu</h1>

      {sent ? (
        <div className="mt-8 space-y-4">
          <p role="status" className="rounded-lg border border-[#C5D0DE] bg-white px-4 py-3 text-[15px] text-[#0E1B2C]">
            Nếu email này có trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu. Vui lòng kiểm tra hộp thư (kể cả mục thư rác).
          </p>
          <Link href="/sign-in" className="inline-flex font-semibold text-[#27548A] hover:underline">Quay lại đăng nhập</Link>
        </div>
      ) : (
        <>
          <p className="mt-3 text-[15px] text-[#5B6B7F]">Nhập email bạn đã dùng để đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.</p>
          <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
            <label className="block text-sm font-medium">
              Email
              <input name="email" type="email" required autoComplete="email" className={field} />
            </label>

            {error && (
              <p role="alert" className="rounded-lg border border-[#F1C2C9] bg-[#FBEDEE] px-4 py-3 text-sm text-[#8E2B3B]">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-lg bg-[#27548A] font-semibold text-white transition-colors hover:bg-[#1F4573] disabled:opacity-60"
            >
              {busy ? "Đang gửi…" : "Gửi link đặt lại"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#5B6B7F]">
            Nhớ mật khẩu rồi? <Link href="/sign-in" className="font-semibold text-[#27548A] hover:underline">Đăng nhập</Link>
          </p>
        </>
      )}
    </main>
  );
}
