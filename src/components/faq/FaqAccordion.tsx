// src/components/faq/FaqAccordion.tsx
"use client";

import { useMemo, useState } from "react";
import { FAQS, FAQ_GROUPS, normalize } from "@/lib/faq";

export default function FaqAccordion() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>("all");

  const items = useMemo(() => {
    const q = normalize(query.trim());
    return FAQS.filter((f) => {
      if (group !== "all" && f.group !== group) return false;
      if (!q) return true;
      return normalize(f.q).includes(q) || normalize(f.a).includes(q);
    });
  }, [query, group]);

  return (
    <div>
      <label htmlFor="faq-search" className="sr-only">
        Tìm câu hỏi
      </label>
      <input
        id="faq-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Nhập từ khóa, ví dụ: sửa thiệp, thanh toán"
        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#27548A] focus:ring-4 focus:ring-[#27548A]/15"
      />

      <div role="tablist" aria-label="Nhóm câu hỏi" className="mt-5 flex flex-wrap gap-2">
        <Tab label="Tất cả" active={group === "all"} onClick={() => setGroup("all")} />
        {FAQ_GROUPS.map((g) => (
          <Tab key={g.slug} label={g.label} active={group === g.slug} onClick={() => setGroup(g.slug)} />
        ))}
      </div>

      <p className="mt-6 text-sm text-slate-500" aria-live="polite">
        {items.length} câu hỏi
      </p>

      {items.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-[#E8EEF6] p-8 text-center text-slate-700">
          Không tìm thấy câu hỏi phù hợp. Hãy thử từ khóa khác hoặc liên hệ với chúng tôi.
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {items.map((f) => (
            <li key={f.id}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-[17px] font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#27548A] [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <svg
                    viewBox="0 0 20 20"
                    className="h-5 w-5 shrink-0 text-[#27548A] transition-transform group-open:rotate-45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M10 4v12M4 10h12" />
                  </svg>
                </summary>
                <p className="px-5 pb-5 text-[16px] leading-7 text-slate-600">{f.a}</p>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        "rounded-full px-4 py-2 text-sm font-medium transition-colors " +
        (active ? "bg-[#27548A] text-white" : "bg-[#E8EEF6] text-[#27548A] hover:bg-[#d6e1ef]")
      }
    >
      {label}
    </button>
  );
}