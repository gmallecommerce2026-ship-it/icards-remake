"use client";

import { useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useEditorStore } from '@/lib/store/editorStore';
// import { Stage, Layer } from 'react-konva'; // Dùng khi build chi tiết CanvasItem

export default function CanvasWrapper() {
    const { present: pages, zoom, setCurrentPage, addPage, removePage, currentPageId } = useEditorStore();
    const containerRef = useRef<HTMLDivElement>(null);

    // Scroll Spy: Cập nhật currentPageId dựa trên vị trí cuộn
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollCenter = container.scrollTop + container.clientHeight / 2;
            let closestId = null;
            let minDistance = Infinity;

            pages.forEach(page => {
                const el = document.getElementById(`page-wrap-${page.id}`);
                if (el) {
                    const pageCenter = el.offsetTop + el.offsetHeight / 2;
                    const distance = Math.abs(scrollCenter - pageCenter);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestId = page.id;
                    }
                }
            });

            if (closestId && closestId !== currentPageId) {
                setCurrentPage(closestId);
            }
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [pages, currentPageId, setCurrentPage]);

    return (
        <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto bg-porcelain py-10 relative flex flex-col items-center gap-12"
            style={{ 
                // Custom scrollbar bằng Tailwind inline styles hoặc globals.css
            }}
        >
            {pages.map((page, index) => (
                <div key={page.id} id={`page-wrap-${page.id}`} className="flex flex-col items-center">
                    
                    {/* Page Toolbar */}
                    <div 
                        className="flex justify-between items-center mb-2 px-2"
                        style={{ width: page.canvasWidth * zoom }}
                    >
                        <span className="text-xs font-semibold text-muted uppercase tracking-widest">
                            {page.name || `Trang ${index + 1}`}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => removePage(page.id)} className="text-muted hover:text-lacquer text-xs font-medium">Xóa</button>
                            <button onClick={addPage} className="text-muted hover:text-ink text-xs font-medium">Thêm</button>
                        </div>
                    </div>

                    {/* Canvas Stage */}
                    <div 
                        className={`bg-white transition-all shadow-[0_4px_24px_rgba(0,0,0,0.06)] relative ${
                            currentPageId === page.id ? 'ring-2 ring-lacquer ring-offset-4 ring-offset-porcelain' : ''
                        }`}
                        style={{
                            width: page.canvasWidth * zoom,
                            height: page.canvasHeight * zoom,
                            backgroundColor: page.backgroundColor,
                            backgroundImage: page.backgroundImage ? `url(${page.backgroundImage})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                        onClick={() => setCurrentPage(page.id)}
                    >
                        {/* Konva Stage sẽ nằm ở đây, nhận props page.items */}
                        <div className="absolute inset-0 flex items-center justify-center text-line/50 pointer-events-none select-none">
                            [Konva Stage {page.canvasWidth}x{page.canvasHeight}]
                        </div>
                    </div>
                </div>
            ))}

            <button 
                onClick={addPage}
                className="mt-4 mb-20 flex items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors px-6 py-3 rounded-xl hover:bg-line/30"
            >
                <Plus className="w-5 h-5" /> Thêm trang mới
            </button>
        </div>
    );
}