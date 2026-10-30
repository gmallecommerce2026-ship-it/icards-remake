"use client";

import { useState } from "react";
import {
    UserPlus,
    Contact,
    Users,
    Upload,
    Download,
    Search,
    Mail
} from "lucide-react";
import { AddGuestModal } from "@/components/modals/AddGuestModal";

export default function GuestsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <div className="flex flex-col gap-6">
            {/* Tiêu đề trang */}
            <div className="bg-[#E8EEF6] px-6 py-4">
                <h2 className="text-lg font-bold text-[#27548A] uppercase">
                    Danh sách khách mời
                </h2>
            </div>

            <div className="flex flex-col gap-6 px-6 pb-6">
                {/* Lời nhắc */}
                <p className="text-sm text-slate-700 font-medium">
                    Gửi thiệp mời qua Email
                </p>

                {/* Thanh công cụ (Action Buttons) */}
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#27548A]">
                        <UserPlus className="h-4 w-4" />
                        Thêm khách mời
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#27548A]">
                        <Contact className="h-4 w-4" />
                        Thêm từ danh bạ
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#27548A]">
                        <Users className="h-4 w-4" />
                        Quản lý nhóm
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#27548A]">
                        <Upload className="h-4 w-4" />
                        Nhập từ Excel
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#27548A]">
                        <Download className="h-4 w-4" />
                        Xuất danh sách
                    </button>
                </div>

                {/* Bộ lọc (Filters) */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-full rounded-md border border-line bg-white pl-9 pr-4 text-sm text-slate-900 outline-none focus:border-[#27548A] focus:ring-1 focus:ring-[#27548A]"
                        />
                    </div>
                    <select className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#27548A] focus:ring-1 focus:ring-[#27548A]">
                        <option value="all">Tất cả nhóm</option>
                        <option value="family">Gia đình</option>
                        <option value="friends">Bạn bè</option>
                        <option value="colleagues">Đồng nghiệp</option>
                    </select>
                    <select className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#27548A] focus:ring-1 focus:ring-[#27548A]">
                        <option value="all">Tất cả trạng thái</option>
                        <option value="attending">Tham gia</option>
                        <option value="not-attending">Không tham gia</option>
                        <option value="pending">Không xác nhận</option>
                    </select>
                    <select className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#27548A] focus:ring-1 focus:ring-[#27548A]">
                        <option value="all">Trạng thái Email</option>
                        <option value="sent">Đã gửi</option>
                        <option value="failed">Gửi lỗi</option>
                        <option value="not-sent">Chưa gửi</option>
                    </select>
                </div>

                {/* Thống kê (Statistics) */}
                <div className="grid grid-cols-2 divide-x divide-y border border-line text-center sm:grid-cols-3 md:grid-cols-5 md:divide-y-0">
                    <div className="flex flex-col gap-1 bg-white p-4">
                        <span className="text-sm text-slate-600">Tổng số khách mời</span>
                        <span className="text-xl font-bold text-[#27548A]">0</span>
                    </div>
                    <div className="flex flex-col gap-1 bg-white p-4">
                        <span className="text-sm text-slate-600">Tham gia</span>
                        <span className="text-xl font-bold text-[#27548A]">0</span>
                    </div>
                    <div className="flex flex-col gap-1 bg-white p-4">
                        <span className="text-sm text-slate-600">Không tham gia</span>
                        <span className="text-xl font-bold text-[#27548A]">0</span>
                    </div>
                    <div className="flex flex-col gap-1 bg-white p-4">
                        <span className="text-sm text-slate-600">Không xác nhận</span>
                        <span className="text-xl font-bold text-[#27548A]">0</span>
                    </div>
                    <div className="flex flex-col gap-1 bg-white p-4">
                        <span className="text-sm text-slate-600">Tiền mừng</span>
                        <span className="text-xl font-bold text-[#27548A]">0 đ</span>
                    </div>
                </div>

                {/* Bảng dữ liệu (Data Table) */}
                <div className="overflow-x-auto rounded-md border border-line bg-white">
                    <table className="w-full min-w-[1000px] text-left text-sm text-slate-700">
                        <thead className="border-b border-line bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
                            <tr>
                                <th className="w-12 border-r border-line px-4 py-3 text-center">#</th>
                                <th className="w-24 border-r border-line px-4 py-3 text-center">GỬI THIỆP</th>
                                <th className="border-r border-line px-4 py-3">TÊN KHÁCH MỜI</th>
                                <th className="border-r border-line px-4 py-3">EMAIL</th>
                                <th className="border-r border-line px-4 py-3">ĐIỆN THOẠI</th>
                                <th className="border-r border-line px-4 py-3">NHÓM KHÁCH MỜI</th>
                                <th className="w-24 border-r border-line px-4 py-3 text-center">THAM GIA</th>
                                <th className="w-24 border-r border-line px-4 py-3 text-center">ĐI CÙNG</th>
                                <th className="border-r border-line px-4 py-3 text-right">MỪNG CƯỚI</th>
                                <th className="w-24 border-r border-line px-4 py-3 text-center">TÁC VỤ</th>
                                <th className="w-12 px-4 py-3 text-center">
                                    <input type="checkbox" className="rounded border-slate-300 text-[#27548A] focus:ring-[#27548A]" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Empty State của bảng */}
                            <tr>
                                <td colSpan={11} className="px-6 py-8 text-center text-slate-500">
                                    Chưa có khách mời nào trong danh sách.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <AddGuestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={(newGuest) => {
                    console.log("Khách mời mới:", newGuest);
                    // Xử lý thêm vào state/dữ liệu của bạn ở đây
                }}
            />
        </div>
    );
}