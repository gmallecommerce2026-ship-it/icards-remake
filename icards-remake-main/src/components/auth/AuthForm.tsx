"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { apiErrorMessage } from "@/lib/api/errors";

const DEFAULT_AFTER_LOGIN = "/invitation-management";

/** Chỉ cho phép chuyển hướng nội bộ (chống open redirect). */
function safeRedirect(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : DEFAULT_AFTER_LOGIN;
}

const field = "mt-1 h-11 w-full rounded-lg border border-[#C5D0DE] bg-white px-3 text-[15px] outline-none focus-visible:border-[#27548A] focus-visible:ring-2 focus-visible:ring-[#27548A]/20";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignUp = mode === "sign-up";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError("");
    setBusy(true);
    try {
      if (isSignUp) {
        await register(
          String(data.get("username") ?? "").trim(),
          String(data.get("email") ?? "").trim(),
          String(data.get("password") ?? ""),
        );
      } else {
        await login(String(data.get("login") ?? "").trim(), String(data.get("password") ?? ""));
      }
      router.replace(safeRedirect(sp.get("redirect")));
    } catch (err) {
      setError(apiErrorMessage(err, isSignUp ? "Không thể đăng ký, vui lòng thử lại." : "Sai tài khoản hoặc mật khẩu."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16 pt-[96px]">
      <h1 className="text-3xl font-bold tracking-tight text-[#0E1B2C]">{isSignUp ? "Tạo tài khoản" : "Đăng nhập"}</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        {isSignUp ? (
          <>
            <label className="block text-sm font-medium">
              Tên đăng nhập
              <input name="username" required minLength={3} maxLength={40} autoComplete="username" className={field} />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input name="email" type="email" required autoComplete="email" className={field} />
            </label>
          </>
        ) : (
          <label className="block text-sm font-medium">
            Tên đăng nhập hoặc email
            <input name="login" required autoComplete="username" className={field} />
          </label>
        )}
        <label className="block text-sm font-medium">
          Mật khẩu
          <input
            name="password"
            type="password"
            required
            minLength={isSignUp ? 8 : undefined}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className={field}
          />
        </label>

        {error && (
          <p role="alert" className="rounded-lg border border-[#F1C2C9] bg-[#FBEDEE] px-4 py-3 text-sm text-[#8E2B3B]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="h-12 w-full rounded-lg bg-[#27548A] font-semibold text-white transition-colors hover:bg-[#1F4573] disabled:opacity-60"
        >
          {busy ? "Đang xử lý…" : isSignUp ? "Đăng ký" : "Đăng nhập"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#5B6B7F]">
        {isSignUp ? (
          <>Đã có tài khoản? <Link href="/sign-in" className="font-semibold text-[#27548A] hover:underline">Đăng nhập</Link></>
        ) : (
          <>Chưa có tài khoản? <Link href="/sign-up" className="font-semibold text-[#27548A] hover:underline">Đăng ký</Link></>
        )}
      </p>
    </main>
  );
}
