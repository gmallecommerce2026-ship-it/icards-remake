"use client";

import { useEffect, useState } from "react";
import * as adminApi from "@/lib/api/admin";
import type { PageCopy } from "@/lib/page-copy";
import { EMPTY_PAGE_COPY } from "@/lib/page-copy";
import { errorMessage } from "@/components/admin/ui";

/** Đọc và lưu chữ trang. Lưu luôn toàn bộ đối tượng để không làm mất phần của trang khác. */
export function usePageCopy() {
  const [copy, setCopy] = useState<PageCopy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .getAdminSettings()
      .then(({ data }) => setCopy(data.pageCopy ?? EMPTY_PAGE_COPY))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const save = async (next: PageCopy) => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const { data } = await adminApi.saveAdminPageCopy(next);
      setCopy(data.pageCopy ?? next);
      setMessage("Đã lưu. Trang công khai cập nhật sau tối đa 1 phút.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return { copy, setCopy, save, saving, error, message, setError, setMessage };
}
