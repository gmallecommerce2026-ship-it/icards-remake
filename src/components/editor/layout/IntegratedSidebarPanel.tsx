"use client";

import { useState, useId } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, Layers, Type, Image as ImageIcon, Lock, Unlock, Eye, EyeOff } from 'lucide-react';

// --- COMPONENT TRANG (Sortable) ---
function SortablePageItem({ page, isSelected, onSelect, onRemove }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });
    
    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 }}
            onClick={() => onSelect(page.id)}
            className={`flex items-center gap-3 p-2 mb-3 rounded-xl border transition-all cursor-pointer bg-white ${
                isSelected ? 'border-lacquer ring-2 ring-lacquer/20' : 'border-line hover:border-lacquer/50'
            } ${isDragging ? 'shadow-lg opacity-90' : ''}`}
        >
            <div {...attributes} {...listeners} className="text-muted hover:text-ink cursor-grab px-1">
                <GripVertical className="w-4 h-4" />
            </div>
            {/* Ảnh Thumb giả lập */}
            <div className="w-12 h-16 bg-porcelain rounded border border-line shrink-0 overflow-hidden" />
            <div className="flex-1 overflow-hidden">
                <p className={`text-sm truncate ${isSelected ? 'font-semibold text-lacquer' : 'text-ink'}`}>
                    {page.name}
                </p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onRemove(page.id); }} className="p-2 text-muted hover:text-red-600 rounded-lg">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

// --- COMPONENT LỚP (Sortable) ---
// (Logic tương tự Pages, tôi rút gọn để không vượt giới hạn output)
// Bạn có thể bê code cũ của SortableLayerItem vào đây và thay Icon MUI thành Lucide.

export default function IntegratedSidebarPanel() {
    const [tab, setTab] = useState<'pages' | 'layers' | 'bg'>('pages');
    
    const { 
        present: pages, currentPageId, setCurrentPage, addPage, removePage, reorderPages,
        selectedIds, setSelection, updateItem, updatePageBackground 
    } = useEditorStore();
    
    const currentPage = pages.find(p => p.id === currentPageId);
    const currentItems = currentPage?.items || [];
    
    // Sửa lỗi Hydration dnd-kit
    const dndIdPages = useId();
    const dndIdLayers = useId();
    
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragEndPages = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) reorderPages(active.id as string, over.id as string);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header của Panel */}
            <div className="p-4 pb-2 border-b border-line shrink-0">
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-1">Bước 1 · Thiết kế thiệp</p>
                <h2 className="text-xl font-bold text-ink mb-4">Trang & Lớp</h2>
                
                {/* Segmented Tabs chuẩn Tailwind */}
                <div className="flex bg-porcelain p-1 rounded-xl">
                    {['pages', 'layers', 'bg'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t as any)}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                tab === t ? 'bg-white shadow-sm text-lacquer' : 'text-muted hover:text-ink'
                            }`}
                        >
                            {t === 'pages' ? `Trang (${pages.length})` : t === 'layers' ? `Lớp (${currentItems.length})` : 'Nền'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Nội dung Tabs */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                
                {/* TAB: TRANG */}
                {tab === 'pages' && (
                    <DndContext id={dndIdPages} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndPages}>
                        <SortableContext items={pages.map(p => p.id)} strategy={verticalListSortingStrategy}>
                            {pages.map(page => (
                                <SortablePageItem 
                                    key={page.id} 
                                    page={page} 
                                    isSelected={currentPageId === page.id} 
                                    onSelect={setCurrentPage} 
                                    onRemove={removePage} 
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                )}

                {/* TAB: LỚP (Tương tự code LayerPanel ở Phần 5 cũ, nhúng dnd-kit vào) */}
                {tab === 'layers' && (
                    <div className="flex flex-col gap-2">
                        {currentItems.length === 0 ? (
                            <p className="text-center text-sm text-muted mt-10">Trang này chưa có đối tượng nào.</p>
                        ) : (
                            <p className="text-xs text-muted mb-2 text-center">Danh sách đối tượng trên trang hiện tại</p>
                            /* Code render Layers... */
                        )}
                    </div>
                )}

                {/* TAB: NỀN */}
                {tab === 'bg' && currentPageId && (
                    <div className="flex flex-col gap-4">
                        <label className="text-sm font-semibold text-ink">Màu nền trang</label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="color" 
                                value={currentPage?.backgroundColor || '#ffffff'}
                                onChange={(e) => updatePageBackground(currentPageId, 'color', e.target.value)}
                                className="w-12 h-12 rounded cursor-pointer border border-line"
                            />
                            <span className="text-sm font-medium uppercase text-muted">{currentPage?.backgroundColor}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Tab Trang */}
            {tab === 'pages' && (
                <div className="p-4 border-t border-line shrink-0">
                    <button 
                        onClick={addPage}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-lacquer text-white font-medium hover:bg-lacquer-dark transition-colors"
                    >
                        <Plus className="w-5 h-5" /> Thêm trang mới
                    </button>
                </div>
            )}
        </div>
    );
}