"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import * as adminApi from "@/lib/api/admin";
import type { AdminUser, Page } from "@/lib/api/admin";
import { ErrorBox, PageTitle, btnCls, btnGhostCls, errorMessage, inputCls } from "@/components/admin/ui";
import { useAuth } from "@/providers/AuthProvider";

const LIMIT = 20;

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [data, setData] = useState<Page<AdminUser> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await adminApi.getAdminUsers({ page, limit: LIMIT, search: query || undefined, role: role || undefined });
      setData(data);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [page, query, role]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  const update = async (u: AdminUser, body: { role?: "user" | "admin"; isActive?: boolean }) => {
    setBusyId(u._id);
    setError(null);
    try {
      await adminApi.updateAdminUser(u._id, body);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;

  return (
    <>
      <PageTitle title="Người dùng" description={data ? `${data.total} tài khoản` : undefined} />
      {error && <ErrorBox>{error}</ErrorBox>}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={onSearch} className="flex gap-2">
          <input className={`${inputCls} w-64`} placeholder="Tìm theo tên, email…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Tìm người dùng" />
          <button type="submit" className={btnCls}>Tìm</button>
        </form>
        <select className={inputCls} value={role} onChange={(e) => { setPage(1); setRole(e.target.value); }} aria-label="Lọc theo vai trò">
          <option value="">Tất cả vai trò</option>
          <option value="user">Người dùng</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>

      <div className="overflow-x-auto border border-[#D9E1EC] bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[#D9E1EC] bg-[#F6F8FB] text-xs uppercase tracking-wide text-[#5B6B7F]">
            <tr>
              <th className="px-4 py-3 font-semibold">Tài khoản</th>
              <th className="px-4 py-3 font-semibold">Vai trò</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold">Ngày tạo</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((u) => {
              const isSelf = me?.id === u._id;
              return (
                <tr key={u._id} className="border-b border-[#EEF2F7] last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{u.username}</p>
                    <p className="text-xs text-[#5B6B7F]">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">{u.role === "admin" ? "Quản trị viên" : "Người dùng"}</td>
                  <td className="px-4 py-3">
                    <span className={u.isActive ? "text-[#1E7A4C]" : "text-[#8E2B3B]"}>{u.isActive ? "Đang hoạt động" : "Đã khoá"}</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={busyId === u._id || isSelf}
                        title={isSelf ? "Không thể tự thay đổi tài khoản đang đăng nhập" : undefined}
                        onClick={() => update(u, { role: u.role === "admin" ? "user" : "admin" })}
                        className={btnGhostCls}
                      >
                        {u.role === "admin" ? "Gỡ quyền admin" : "Cấp quyền admin"}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === u._id || isSelf}
                        title={isSelf ? "Không thể tự khoá tài khoản đang đăng nhập" : undefined}
                        onClick={() => update(u, { isActive: !u.isActive })}
                        className={btnGhostCls}
                      >
                        {u.isActive ? "Khoá" : "Mở khoá"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {data && data.items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-[#5B6B7F]">Không có người dùng nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3 text-sm">
        <button type="button" className={btnGhostCls} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Trước</button>
        <span className="tabular-nums">Trang {page} / {totalPages}</span>
        <button type="button" className={btnGhostCls} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Sau</button>
      </div>
    </>
  );
}
