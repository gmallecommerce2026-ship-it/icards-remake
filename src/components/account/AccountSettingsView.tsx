"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Camera, Check } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useUiTheme } from "@/components/ui/useUiTheme";

type U = { name: string; email: string; phone: string; avatarBg: string };

/* Các trường giống nhau ở mọi theme; chỉ khác cách bố trí và kiểu ô nhập */
function Field({ id, label, children, hint }: { id: string; label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Avatar({ user, size, shape }: { user: U; size: string; shape: string }) {
  return (
    <div className={`relative flex shrink-0 items-center justify-center text-white font-bold ${size} ${shape}`} style={{ backgroundColor: user.avatarBg }}>
      <span className="text-2xl">{user.name.charAt(0)}</span>
      <button type="button" title="Đổi ảnh đại diện" className="absolute bottom-0 right-0 grid size-8 place-items-center border-2 border-white bg-ink text-white">
        <Camera className="size-4" />
      </button>
    </div>
  );
}

export function AccountSettingsView() {
  const { user } = useAuth();
  const theme = useUiTheme();
  const [saved, setSaved] = useState(false);

  if (!user) return null;
  const u: U = { name: user.name, email: user.email, phone: user.phone, avatarBg: user.avatarBg };

  // giữ nguyên hành vi hiện có: lưu giả lập, báo "Đã lưu" trong 3 giây
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputBase = "w-full text-sm outline-none transition-colors";
  const emailNote = "Email đăng nhập không thể thay đổi. Vui lòng liên hệ hỗ trợ nếu bạn cần đổi email.";

  const fields = (cls: { wrap: string; input: string; email: string }) => (
    <div className={cls.wrap}>
      <Field id="name" label="Họ và tên"><input id="name" defaultValue={u.name} className={cls.input} /></Field>
      <Field id="phone" label="Số điện thoại"><input id="phone" type="tel" defaultValue={u.phone} className={cls.input} /></Field>
      <Field id="email" label="Địa chỉ Email" hint={emailNote}><input id="email" type="email" defaultValue={u.email} disabled className={cls.email} /></Field>
    </div>
  );

  const saveRow = (btn: string) => (
    <div className="flex items-center gap-4">
      <button type="submit" className={btn}>Lưu thay đổi</button>
      {saved && <span className="flex items-center text-sm font-medium text-[#1D5B35]"><Check className="mr-1 size-4" /> Đã lưu</span>}
    </div>
  );

  /* 1 · THIỆP GIẤY: tiêu đề serif căn giữa, form một cột trong khung giấy */
  if (theme === "1") return (
    <div className="mx-auto max-w-xl text-center">
      <h1 className="font-display text-4xl font-medium">Cài đặt tài khoản</h1>
      <p className="mt-3 text-muted">Quản lý thông tin cá nhân của bạn.</p>
      <form onSubmit={onSubmit} className="mt-12 border border-line bg-white p-10 text-left">
        <div className="mb-10 flex flex-col items-center gap-4">
          <Avatar user={u} size="size-24" shape="rounded-full" />
          <p className="text-xs text-muted">Nên dùng ảnh vuông, tối đa 2MB.</p>
        </div>
        <div className="space-y-7">{fields({ wrap: "space-y-7", input: `${inputBase} border-b border-ink/25 bg-transparent py-2 focus:border-lacquer`, email: `${inputBase} border-b border-line bg-transparent py-2 text-muted` })}</div>
        <div className="mt-10 border-t border-line pt-6">{saveRow("bg-ink px-7 py-3 text-sm font-semibold text-white")}</div>
      </form>
    </div>
  );

  /* 2 · TỐI GIẢN: hai cột, cột trái là nhãn, cột phải là ô nhập đường kẻ */
  if (theme === "2") return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Cài đặt tài khoản</h1>
      <form onSubmit={onSubmit} className="mt-12 grid gap-10 border-t border-ink pt-10 md:grid-cols-[200px_1fr]">
        <div>
          <p className="font-semibold">Hồ sơ</p>
          <p className="mt-2 text-sm text-muted">Thông tin hiển thị với khách và trong tài khoản.</p>
        </div>
        <div className="space-y-8">
          <div className="flex items-center gap-5"><Avatar user={u} size="size-16" shape="" /><p className="text-sm text-muted">Ảnh đại diện vuông, tối đa 2MB.</p></div>
          {fields({ wrap: "space-y-8", input: `${inputBase} border-b border-ink/30 bg-transparent py-2 focus:border-ink`, email: `${inputBase} border-b border-line bg-transparent py-2 text-muted` })}
          <div className="pt-4">{saveRow("bg-ink px-6 py-3 text-sm font-semibold text-white")}</div>
        </div>
      </form>
    </div>
  );

  /* 3 · HIỆN ĐẠI: thẻ có dải tiêu đề màu, ô nhập nền nhạt */
  if (theme === "3") return (
    <div>
      <h1 className="font-display text-4xl font-bold tracking-tight">Cài đặt tài khoản</h1>
      <form onSubmit={onSubmit} className="mt-10 overflow-hidden rounded-xl bg-white shadow-md">
        <div className="flex items-center gap-5 bg-lacquer p-6 text-white">
          <Avatar user={u} size="size-16" shape="rounded-lg" />
          <div><p className="font-semibold">{u.name}</p><p className="text-sm text-white/75">{u.email}</p></div>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          {fields({ wrap: "contents", input: `${inputBase} rounded-lg bg-paper px-4 py-3 focus:ring-2 focus:ring-lacquer/40`, email: `${inputBase} rounded-lg bg-porcelain px-4 py-3 text-muted` })}
        </div>
        <div className="border-t border-line p-6">{saveRow("rounded-lg bg-lacquer px-6 py-3 text-sm font-semibold text-white")}</div>
      </form>
    </div>
  );

  /* 4 · BOHO ẤM: ảnh đại diện lớn, ô nhập viên thuốc, khung mềm */
  if (theme === "4") return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="font-display text-4xl italic">Cài đặt tài khoản</h1>
      <form onSubmit={onSubmit} className="mt-12 rounded-t-[180px] border border-line bg-white px-10 pb-12 pt-16 text-left">
        <div className="mb-10 flex justify-center"><Avatar user={u} size="size-28" shape="rounded-full" /></div>
        <div className="space-y-7">{fields({ wrap: "space-y-7", input: `${inputBase} rounded-sm border border-ink/15 bg-paper px-5 py-3`, email: `${inputBase} rounded-sm border border-line bg-porcelain px-5 py-3 text-muted` })}</div>
        <div className="mt-10 flex justify-center">{saveRow("rounded-sm bg-lacquer px-8 py-3 text-sm font-semibold text-white")}</div>
      </form>
    </div>
  );

  /* 5 · CỔ ĐIỂN: dạng sổ cái, nhãn serif bên trái, đường vàng ngăn các dòng */
  return (
    <div>
      <h1 className="font-display text-4xl">Cài đặt tài khoản</h1>
      <span className="mt-6 block h-px w-12 bg-gold" aria-hidden />
      <form onSubmit={onSubmit} className="mt-12">
        <div className="flex items-center gap-6 border-b border-gold/50 pb-8">
          <Avatar user={u} size="size-20" shape="rounded-full" />
          <p className="text-sm text-muted">Ảnh đại diện vuông, tối đa 2MB.</p>
        </div>
        {[
          { id: "name", label: "Họ và tên", el: <input id="name" defaultValue={u.name} className={`${inputBase} bg-transparent py-2 text-right`} /> },
          { id: "phone", label: "Số điện thoại", el: <input id="phone" type="tel" defaultValue={u.phone} className={`${inputBase} bg-transparent py-2 text-right`} /> },
          { id: "email", label: "Địa chỉ Email", el: <input id="email" type="email" defaultValue={u.email} disabled className={`${inputBase} bg-transparent py-2 text-right text-muted`} /> },
        ].map((r) => (
          <div key={r.id} className="grid items-center gap-4 border-b border-gold/50 py-6 sm:grid-cols-[1fr_1.4fr]">
            <label htmlFor={r.id} className="font-display text-xl">{r.label}</label>
            {r.el}
          </div>
        ))}
        <p className="mt-4 text-xs text-muted">{emailNote}</p>
        <div className="mt-10">{saveRow("bg-lacquer px-7 py-3 text-sm font-semibold text-white")}</div>
      </form>
    </div>
  );
}
