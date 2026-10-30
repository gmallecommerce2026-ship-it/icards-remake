"use client";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export function Field({ label, error, type = "text", className = "", ...rest }: Props) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={isPw && show ? "text" : type}
          aria-invalid={!!error}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition placeholder:text-muted/60 focus:border-lacquer focus:ring-4 focus:ring-lacquer/10 ${error ? "border-red-400" : "border-line"} ${isPw ? "pr-12" : ""} ${className}`}
          {...rest}
        />
        {isPw && (
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function FormAlert({ type, children }: { type: "error" | "success"; children: React.ReactNode }) {
  const c = type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700";
  return <div role="alert" className={`rounded-xl border px-4 py-3 text-sm ${c}`}>{children}</div>;
}

export const apiError = (e: unknown, fallback = "Đã có lỗi xảy ra, vui lòng thử lại.") =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
