"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (guest: { name: string; email: string; phone: string; group: string }) => void;
}

export function AddGuestModal({ isOpen, onClose, onAdd }: AddGuestModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [group, setGroup] = useState("Gia đình");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAdd({ name, email, phone, group });
    // Reset form & đóng modal
    setName("");
    setEmail("");
    setPhone("");
    setGroup("Gia đình");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="text-lg font-bold text-[#27548A]">Thêm khách mời mới</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Tên khách mời <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên khách mời..."
              className="h-10 w-full rounded-lg border border-line bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#27548A] focus:ring-1 focus:ring-[#27548A]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhap@email.com"
              className="h-10 w-full rounded-lg border border-line bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#27548A] focus:ring-1 focus:ring-[#27548A]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              className="h-10 w-full rounded-lg border border-line bg-white px-4 text-sm text-slate-900 outline-none focus:border-[#27548A] focus:ring-1 focus:ring-[#27548A]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Nhóm khách mời
            </label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#27548A] focus:ring-1 focus:ring-[#27548A]"
            >
              <option value="Gia đình">Gia đình</option>
              <option value="Bạn bè">Bạn bè</option>
              <option value="Đồng nghiệp">Đồng nghiệp</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* Footer Actions */}
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#27548A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e4270]"
            >
              Lưu khách mời
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}