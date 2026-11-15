"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { ErrorBox, btnCls, errorMessage, inputCls } from "@/components/admin/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, login, logout } = useAuth();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sau khi đăng nhập: admin thì vào trang quản trị; tài khoản thường thì đăng xuất ngay
  useEffect(() => {
    if (!submitted || !user) return;
    if (user.role === "admin") {
      router.replace("/admin");
      return;
    }
    setSubmitted(false);
    setError("Tài khoản này không có quyền quản trị.");
    void logout();
  }, [submitted, user, router, logout]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSubmitted(true);
    try {
      await login(loginId, password);
    } catch (err) {
      setSubmitted(false);
      setError(errorMessage(err, "Đăng nhập thất bại"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#F6F8FB] px-5">
      <form onSubmit={submit} className="w-full max-w-sm border border-[#D9E1EC] bg-white p-7 shadow-sm">
        <h1 className="text-xl font-bold">Đăng nhập quản trị</h1>
        <p className="mt-1 text-sm text-[#5B6B7F]">Chỉ tài khoản quản trị viên mới truy cập được.</p>
        <div className="mt-6 space-y-4">
          {error && <ErrorBox>{error}</ErrorBox>}
          <label className="grid gap-1.5 text-sm font-medium">
            Tên đăng nhập hoặc email
            <input className={inputCls} value={loginId} onChange={(e) => setLoginId(e.target.value)} autoComplete="username" required />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Mật khẩu
            <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </label>
          <button type="submit" disabled={busy} className={`${btnCls} w-full`}>
            {busy ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </div>
      </form>
    </div>
  );
}
