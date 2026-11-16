"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { resetPassword } from "@/lib/api/auth";
import { errorText } from "@/lib/invitation-flow";

const field = "mt-1 h-11 w-full rounded-lg border border-[#C5D0DE] bg-white px-3 text-[15px] outline-none focus-visible:border-[#27548A] focus-visible:ring-2 focus-visible:ring-[#27548A]/20";

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    if (password.length < 8) return setError("Mật khẩu cần ít nhất 8 ký tự.");
    if (password !== confirm) return setError("Hai mật khẩu chưa khớp.");

    setBusy(true);
    setError("");
    try {
      await resetPassword(token, { password });
      setDone(true);
    } catch (err) {
      setError(errorText(err, "Link đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu link mới."));
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16 pt-[96px]">
        <h1 className="text-3xl font-bold tracking-tight text-[#0E1B2C]">Link không hợp lệ</h1>
        <p className="mt-3 text-[15px] text-[#5B6B7F]">Link đặt lại mật khẩu thiếu mã xác nhận. Hãy mở lại link trong email, hoặc yêu cầu link mới.</p>
        <Link href="/forgot-password" className="mt-6 inline-flex font-semibold text-[#27548A] hover:underline">Yêu cầu link mới</Link>
      </main>
    );
  }

  if (done) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16 pt-[96px]">
        <h1 className="text-3xl font-bold tracking-tight text-[#0E1B2C]">Đã đổi mật khẩu</h1>
        <p className="mt-3 text-[15px] text-[#5B6B7F]">Bạn có thể đăng nhập bằng mật khẩu mới.</p>
        <Link href="/sign-in" className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-[#27548A] px-6 font-semibold text-white hover:bg-[#1F4573]">Đăng nhập</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16 pt-[96px]">
      <h1 className="text-3xl font-bold tracking-tight text-[#0E1B2C]">Đặt lại mật khẩu</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <label className="block text-sm font-medium">
          Mật khẩu mới
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className={field} />
        </label>
        <label className="block text-sm font-medium">
          Nhập lại mật khẩu mới
          <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={field} />
        </label>

        {error && (
          <p role="alert" className="rounded-lg border border-[#F1C2C9] bg-[#FBEDEE] px-4 py-3 text-sm text-[#8E2B3B]">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="h-12 w-full rounded-lg bg-[#27548A] font-semibold text-white transition-colors hover:bg-[#1F4573] disabled:opacity-60"
        >
          {busy ? "Đang lưu…" : "Đổi mật khẩu"}
        </button>
      </form>
    </main>
  );
}
