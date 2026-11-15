// Danh mục phong bì và lớp lót (hoạ tiết bên trong) do backend quản lý (khóa 'envelope.presets').
// Tải một lần cho cả phiên; nếu API lỗi thì dùng danh sách dự phòng trong envelope.data.ts.
import { useEffect, useState } from "react";
import { api } from "@/lib/api/http";
import { ENVELOPES, LINERS, type EnvelopeOption, type LinerOption } from "@/components/invitation/envelope/envelope.data";

export type EnvelopeCatalog = { envelopes: EnvelopeOption[]; liners: LinerOption[] };

const FALLBACK: EnvelopeCatalog = { envelopes: ENVELOPES, liners: LINERS };

let cache: Promise<EnvelopeCatalog> | null = null;

function load(): Promise<EnvelopeCatalog> {
  if (!cache) {
    cache = api
      .get("/envelope-presets")
      .then((r) => {
        const d = r.data as Partial<EnvelopeCatalog> | undefined;
        return d && Array.isArray(d.envelopes) && Array.isArray(d.liners) && d.envelopes.length && d.liners.length
          ? (d as EnvelopeCatalog)
          : FALLBACK;
      })
      .catch(() => FALLBACK);
  }
  return cache;
}

export function useEnvelopeCatalog(): EnvelopeCatalog {
  const [catalog, setCatalog] = useState<EnvelopeCatalog>(FALLBACK);
  useEffect(() => {
    let alive = true;
    load().then((c) => alive && setCatalog(c));
    return () => {
      alive = false;
    };
  }, []);
  return catalog;
}
