"use client";

import { useCallback, useEffect, useState } from "react";
import { invitationsApi } from "@/lib/api";
import type { ApiInvitation } from "@/lib/invitation-flow";
import { errorText } from "@/lib/invitation-flow";

/** Tải một thiệp của người dùng hiện tại (GET /invitations/:id). */
export function useInvitation(id: string) {
  const [inv, setInv] = useState<ApiInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await invitationsApi.getInvitation(id);
      setInv(data as ApiInvitation);
      setError("");
    } catch (err) {
      setInv(null);
      setError(errorText(err, "Không tải được thiệp mời."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { inv, setInv, loading, error, reload };
}

export const btn = "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors disabled:opacity-50";
export const btnPrimary = `${btn} bg-lacquer text-white hover:bg-lacquer-dark`;
export const btnGhost = `${btn} border border-line bg-white text-ink hover:bg-porcelain`;
export const btnDanger = `${btn} border border-red-200 bg-white text-red-700 hover:bg-red-50`;
export const card = "rounded-xl border border-line bg-white p-5";
export const input = "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-lacquer/30";
