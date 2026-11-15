"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { pagesApi } from "@/lib/api";

type Item = { q: string; a: string };

export function FaqList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    pagesApi.getFaq()
      .then((res) => {
        // API trả về mảng khối nội dung [câu hỏi, trả lời, câu hỏi, trả lời...]
        const c: { type: string; content: string }[] = res.data?.data?.content ?? [];
        const out: Item[] = [];
        for (let i = 0; i < c.length; i += 2) {
          if (c[i]?.type === "text" && c[i + 1]?.type === "text") out.push({ q: c[i].content, a: c[i + 1].content });
        }
        setItems(out);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mx-auto max-w-3xl space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-line/60" />)}</div>;
  if (!items.length) return <p className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-8 text-center text-muted">Chưa có câu hỏi nào. Nội dung sẽ hiện khi trang “faq” được tạo trong phần quản trị.</p>;

  return (
    <div className="mx-auto max-w-3xl divide-y divide-line rounded-2xl border border-line bg-white">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold transition hover:text-lacquer">
              {it.q}
              <Plus className={`size-5 shrink-0 text-lacquer transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  {/* Nội dung do quản trị viên nhập, có thể chứa HTML */}
                  <div className="px-6 pb-6 leading-relaxed text-muted" dangerouslySetInnerHTML={{ __html: it.a.replace(/\n/g, "<br />") }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
