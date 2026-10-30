"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Camera, Check } from "lucide-react";

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Giả lập lưu dữ liệu API
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Cài đặt tài khoản</h1>
        <p className="text-sm text-muted mt-1">Quản lý thông tin cá nhân và mật khẩu của bạn.</p>
      </div>

      <div className="rounded-2xl border border-line bg-white">
        <div className="border-b border-line px-6 py-5">
          <h2 className="font-semibold text-ink">Hồ sơ cá nhân</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-8 flex items-center gap-6">
            <div 
              className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-3xl text-white font-bold"
              style={{ backgroundColor: user.avatarBg }}
            >
              {user.name.charAt(0)}
              <button 
                type="button"
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-ink text-white transition-transform hover:scale-110 focus-visible:outline-none"
                title="Đổi ảnh đại diện"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <p className="font-medium text-ink">Ảnh đại diện</p>
              <p className="text-xs text-muted mt-1">Nên dùng ảnh vuông, kích thước tối đa 2MB.</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-ink">Họ và tên</label>
              <input
                id="name"
                type="text"
                defaultValue={user.name}
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-lacquer focus:ring-1 focus:ring-lacquer"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-ink">Số điện thoại</label>
              <input
                id="phone"
                type="tel"
                defaultValue={user.phone}
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-lacquer focus:ring-1 focus:ring-lacquer"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="email" className="text-sm font-medium text-ink">Địa chỉ Email</label>
              <input
                id="email"
                type="email"
                defaultValue={user.email}
                disabled
                className="w-full rounded-xl border border-line bg-porcelain px-4 py-2.5 text-sm text-muted cursor-not-allowed outline-none"
              />
              <p className="text-xs text-muted">Email đăng nhập không thể thay đổi. Vui lòng liên hệ hỗ trợ nếu bạn cần đổi email.</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4 border-t border-line pt-6">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-ink px-6 text-sm font-medium text-white transition-colors hover:bg-ink/80 focus-visible:outline-none"
            >
              Lưu thay đổi
            </button>
            {isSaved && (
              <span className="flex items-center text-sm font-medium text-[#1D5B35]">
                <Check className="mr-1 h-4 w-4" /> Đã lưu
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}