"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { forgotPassword, resetPassword, verifyResetOtp } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/api/errors";

const field = "mt-1 h-11 w-full rounded-lg border border-[#C5D0DE] bg-white px-3 text-[15px] outline-none focus-visible:border-[#27548A] focus-visible:ring-2 focus-visible:ring-[#27548A]/20";
const otpField = "mt-1 h-14 w-full rounded-lg border border-[#C5D0DE] bg-white px-3 text-center text-2xl font-semibold tracking-[0.5em] outline-none focus-visible:border-[#27548A] focus-visible:ring-2 focus-visible:ring-[#27548A]/20";
const primaryBtn = "h-12 w-full rounded-lg bg-[#27548A] font-semibold text-white transition-colors hover:bg-[#1F4573] disabled:opacity-60";
const alertBox = "rounded-lg border border-[#F1C2C9] bg-[#FBEDEE] px-4 py-3 text-sm text-[#8E2B3B]";

/** Thời gian chờ trước khi được gửi lại mã (khớp với backend) */
const RESEND_SECONDS = 60;

type Step = "email" | "otp" | "password" | "done";

const STEP_TITLE: Record<Step, string> = {
  email: "Quên mật khẩu",
  otp: "Nhập mã xác nhận",
  password: "Đặt mật khẩu mới",
  done: "Đã đổi mật khẩu",
};

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Đếm ngược thời gian được phép gửi lại mã
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function requestCode(address: string) {
    // Backend luôn trả cùng một thông báo, nên ở đây chỉ báo lỗi kỹ thuật (mất mạng, bị giới hạn số lần...)
    await forgotPassword(address);
    setCooldown(RESEND_SECONDS);
  }

  async function onEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const address = email.trim();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await requestCode(address);
      setCode("");
      setStep("otp");
    } catch (err) {
      setError(apiErrorMessage(err, "Không gửi được mã, vui lòng thử lại."));
    } finally {
      setBusy(false);
    }
  }

  async function onResend() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await requestCode(email.trim());
      setCode("");
      setNotice("Đã gửi lại mã. Vui lòng kiểm tra hộp thư.");
    } catch (err) {
      setError(apiErrorMessage(err, "Không gửi được mã, vui lòng thử lại."));
    } finally {
      setBusy(false);
    }
  }

  async function onOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await verifyResetOtp(email.trim(), code);
      setResetToken(data.resetToken);
      setStep("password");
    } catch (err) {
      setError(apiErrorMessage(err, "Mã xác nhận không đúng hoặc đã hết hạn."));
    } finally {
      setBusy(false);
    }
  }

  async function onPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    if (password.length < 8) return setError("Mật khẩu cần ít nhất 8 ký tự.");
    if (password !== confirm) return setError("Hai mật khẩu chưa khớp.");

    setBusy(true);
    setError("");
    try {
      await resetPassword(resetToken, { password });
      setStep("done");
    } catch (err) {
      setError(apiErrorMessage(err, "Phiên xác nhận đã hết hạn. Vui lòng bắt đầu lại."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16 pt-[96px]">
      {step !== "done" && (
        <p className="text-sm font-medium text-[#5B6B7F]">Bước {["email", "otp", "password"].indexOf(step) + 1} / 3</p>
      )}
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0E1B2C]">{STEP_TITLE[step]}</h1>

      {step === "email" && (
        <>
          <p className="mt-3 text-[15px] text-[#5B6B7F]">Nhập email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi một mã xác nhận gồm 6 chữ số.</p>
          <form onSubmit={onEmail} className="mt-8 space-y-5" noValidate>
            <label className="block text-sm font-medium">
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
              />
            </label>
            {error && <p role="alert" className={alertBox}>{error}</p>}
            <button type="submit" disabled={busy || !email.trim()} className={primaryBtn}>
              {busy ? "Đang gửi…" : "Gửi mã xác nhận"}
            </button>
          </form>
        </>
      )}

      {step === "otp" && (
        <>
          <p className="mt-3 text-[15px] text-[#5B6B7F]">
            Mã gồm 6 chữ số đã được gửi tới <strong className="text-[#0E1B2C]">{email.trim()}</strong>. Mã có hiệu lực trong 10 phút.
          </p>
          <form onSubmit={onOtp} className="mt-8 space-y-5" noValidate>
            <label className="block text-sm font-medium">
              Mã xác nhận
              <input
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="------"
                className={otpField}
              />
            </label>
            {notice && <p role="status" className="rounded-lg border border-[#C5D0DE] bg-white px-4 py-3 text-sm text-[#0E1B2C]">{notice}</p>}
            {error && <p role="alert" className={alertBox}>{error}</p>}
            <button type="submit" disabled={busy || code.length !== 6} className={primaryBtn}>
              {busy ? "Đang kiểm tra…" : "Xác nhận"}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <button
              type="button"
              onClick={onResend}
              disabled={busy || cooldown > 0}
              className="font-semibold text-[#27548A] hover:underline disabled:cursor-not-allowed disabled:text-[#8A97A8] disabled:no-underline"
            >
              {cooldown > 0 ? `Gửi lại mã sau ${cooldown} giây` : "Gửi lại mã"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setError(""); setNotice(""); }}
              className="font-medium text-[#5B6B7F] hover:underline"
            >
              Đổi email khác
            </button>
          </div>
          <p className="mt-4 text-xs text-[#5B6B7F]">Chưa thấy email? Hãy kiểm tra mục thư rác hoặc quảng cáo.</p>
        </>
      )}

      {step === "password" && (
        <>
          <p className="mt-3 text-[15px] text-[#5B6B7F]">Mã đã được xác nhận. Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>
          <form onSubmit={onPassword} className="mt-8 space-y-5" noValidate>
            <label className="block text-sm font-medium">
              Mật khẩu mới
              <input name="password" type="password" required minLength={8} autoComplete="new-password" autoFocus className={field} />
            </label>
            <label className="block text-sm font-medium">
              Nhập lại mật khẩu mới
              <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={field} />
            </label>
            {error && <p role="alert" className={alertBox}>{error}</p>}
            <button type="submit" disabled={busy} className={primaryBtn}>
              {busy ? "Đang lưu…" : "Đổi mật khẩu"}
            </button>
          </form>
        </>
      )}

      {step === "done" && (
        <>
          <p className="mt-3 text-[15px] text-[#5B6B7F]">Bạn có thể đăng nhập bằng mật khẩu mới.</p>
          <Link href="/sign-in" className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-[#27548A] px-6 font-semibold text-white hover:bg-[#1F4573]">
            Đăng nhập
          </Link>
        </>
      )}

      {step !== "done" && (
        <p className="mt-8 text-center text-sm text-[#5B6B7F]">
          Nhớ mật khẩu rồi? <Link href="/sign-in" className="font-semibold text-[#27548A] hover:underline">Đăng nhập</Link>
        </p>
      )}
    </main>
  );
}
