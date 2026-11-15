"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import * as adminApi from "@/lib/api/admin";
import type { AdminInvitation, Page } from "@/lib/api/admin";
import { ErrorBox, PageTitle, btnCls, btnGhostCls, errorMessage, inputCls } from "@/components/admin/ui";

const LIMIT = 20;

export default function AdminInvitationsPage() {
  const [data, setData] = useState<Page<AdminInvitation> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await adminApi.getAdminInvitations({ page, limit: LIMIT, search: query || undefined, status: status || undefined });
      setData(data);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [page, query, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;

  return (
    <>
      <PageTitle title="Thiệp mời" description={data ? `${data.total} thiệp` : undefined} />
      {error && <ErrorBox>{error}</ErrorBox>}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={onSearch} className="flex gap-2">
          <input className={`${inputCls} w-64`} placeholder="Tìm theo tiêu đề…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Tìm thiệp" />
          <button type="submit" className={btnCls}>Tìm</button>
        </form>
        <select className={inputCls} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} aria-label="Lọc theo trạng thái">
          <option value="">Tất cả trạng thái</option>
          <option value="draft">Bản nháp</option>
          <option value="published">Đã xuất bản</option>
        </select>
      </div>

      <div className="overflow-x-auto border border-[#D9E1EC] bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[#D9E1EC] bg-[#F6F8FB] text-xs uppercase tracking-wide text-[#5B6B7F]">
            <tr>
              <th className="px-4 py-3 font-semibold">Tiêu đề</th>
              <th className="px-4 py-3 font-semibold">Chủ thiệp</th>
              <th className="px-4 py-3 font-semibold">Trạng thái</th>
              <th className="px-4 py-3 font-semibold">Cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((i) => (
              <tr key={i._id} className="border-b border-[#EEF2F7] last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold">{i.title}</p>
                  <p className="text-xs text-[#5B6B7F]">/{i.slug}</p>
                </td>
                <td className="px-4 py-3">{i.owner?.username || i.owner?.email || "—"}</td>
                <td className="px-4 py-3">{i.status === "published" ? "Đã xuất bản" : "Bản nháp"}</td>
                <td className="px-4 py-3 tabular-nums">{new Date(i.updatedAt).toLocaleDateString("vi-VN")}</td>
              </tr>
            ))}
            {data && data.items.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-[#5B6B7F]">Không có thiệp nào.</td></tr>
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
