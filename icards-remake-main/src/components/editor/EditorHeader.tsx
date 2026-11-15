"use client";

import { useEditorStore } from '@/lib/store/editorStore';
import { Undo2, Redo2, Copy, ClipboardPaste, Download, Save, Eye, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditorHeader({ slug, setSlug }: { slug: string; setSlug: (s: string) => void }) {
    const { past, future, selectedIds, clipboard, undo, redo, copy, paste } = useEditorStore();

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-4 z-50">
            <div className="flex items-center gap-4">
                <Link href="/invitation-management" className="flex items-center text-muted hover:text-ink transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <div className="h-6 w-px bg-line" />
                
                <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Tên thiệp của bạn"
                    className="w-64 rounded-lg border border-line bg-porcelain px-3 py-1.5 text-sm outline-none focus:border-lacquer focus:ring-1 focus:ring-lacquer"
                />
            </div>

            {/* Khối Lịch sử & Clipboard */}
            <div className="flex items-center gap-1 rounded-xl border border-line p-1 bg-porcelain">
                <button 
                    onClick={undo} disabled={past.length === 0}
                    className="p-1.5 rounded-lg text-ink hover:bg-white disabled:opacity-30 transition-all"
                    title="Hoàn tác (Ctrl+Z)"
                >
                    <Undo2 className="h-4 w-4" />
                </button>
                <button 
                    onClick={redo} disabled={future.length === 0}
                    className="p-1.5 rounded-lg text-ink hover:bg-white disabled:opacity-30 transition-all"
                    title="Làm lại (Ctrl+Y)"
                >
                    <Redo2 className="h-4 w-4" />
                </button>
                <div className="h-4 w-px bg-line mx-1" />
                <button 
                    onClick={copy} disabled={selectedIds.length === 0}
                    className="p-1.5 rounded-lg text-ink hover:bg-white disabled:opacity-30 transition-all"
                    title="Sao chép (Ctrl+C)"
                >
                    <Copy className="h-4 w-4" />
                </button>
                <button 
                    onClick={paste} disabled={clipboard.length === 0}
                    className="p-1.5 rounded-lg text-ink hover:bg-white disabled:opacity-30 transition-all"
                    title="Dán (Ctrl+V)"
                >
                    <ClipboardPaste className="h-4 w-4" />
                </button>
            </div>

            <div className="flex items-center gap-3">
                <button className="flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-medium text-ink hover:bg-porcelain transition-colors">
                    <Download className="h-4 w-4" /> Tải về
                </button>
                <button className="flex h-9 items-center gap-2 rounded-lg border border-lacquer bg-lacquer-soft px-4 text-sm font-medium text-lacquer hover:bg-lacquer hover:text-white transition-colors">
                    <Eye className="h-4 w-4" /> Xem trước
                </button>
                <button className="flex h-9 items-center gap-2 rounded-lg bg-lacquer px-5 text-sm font-medium text-white hover:bg-lacquer-dark transition-colors shadow-sm">
                    <Save className="h-4 w-4" /> Lưu thay đổi
                </button>
            </div>
        </header>
    );
}