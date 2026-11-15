import type { ReactNode } from "react";

export function PageTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-[#5B6B7F]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="border border-[#D9E1EC] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5B6B7F]">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-[#5B6B7F]">{hint}</p>}
    </div>
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return <div role="alert" className="mb-4 rounded-md border border-[#F1C2C9] bg-[#FBEDEE] px-4 py-3 text-sm text-[#8E2B3B]">{children}</div>;
}

export function errorMessage(e: unknown, fallback = "Đã có lỗi xảy ra, vui lòng thử lại."): string {
  const data = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data;
  const m = data?.message;
  if (Array.isArray(m)) return m.join(", ");
  return m || fallback;
}

export const inputCls = "h-10 rounded-md border border-[#C5D0DE] bg-white px-3 text-sm outline-none focus:border-[#27548A]";
export const btnCls = "inline-flex h-10 items-center justify-center rounded-md bg-[#27548A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1b3d66] disabled:opacity-50";
export const btnGhostCls = "inline-flex h-9 items-center justify-center rounded-md border border-[#C5D0DE] bg-white px-3 text-sm font-medium transition-colors hover:border-[#27548A] disabled:opacity-40";
