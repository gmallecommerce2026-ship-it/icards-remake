"use client";

import { useEditorStore } from '@/lib/store/useEditorStore';
import { Layers, Type, Image as ImageIcon, Lock, Unlock, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';

export default function LayersPanel() {
    const { present, currentPageId, selectedIds, setSelection, updateItem } = useEditorStore();
    
    const currentPage = present.find(p => p.id === currentPageId);
    if (!currentPage || currentPage.items.length === 0) return null;

    // Sắp xếp các lớp từ trên xuống dưới (z-index cao nằm trên)
    const reversedItems = [...currentPage.items].sort((a, b) => b.zIndex - a.zIndex);

    // Đổi thứ tự lớp (Thay vì dnd-kit, dùng nút lên xuống trực tiếp cực nhanh và không có độ trễ)
    const moveLayer = (item: any, direction: 'up' | 'down') => {
        const sortedAsc = [...currentPage.items].sort((a, b) => a.zIndex - b.zIndex);
        const index = sortedAsc.findIndex(i => i.id === item.id);
        
        if (direction === 'up' && index < sortedAsc.length - 1) {
            const nextItem = sortedAsc[index + 1];
            updateItem(item.id, { zIndex: nextItem.zIndex }, false);
            updateItem(nextItem.id, { zIndex: item.zIndex }, true);
        } else if (direction === 'down' && index > 0) {
            const prevItem = sortedAsc[index - 1];
            updateItem(item.id, { zIndex: prevItem.zIndex }, false);
            updateItem(prevItem.id, { zIndex: item.zIndex }, true);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-line w-[300px] shrink-0 shadow-sm">
            <div className="p-4 border-b border-line flex items-center gap-2">
                <Layers className="w-5 h-5 text-lacquer" />
                <h3 className="font-bold text-ink text-lg">Quản lý Lớp (Layers)</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                {reversedItems.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                        <div 
                            key={item.id}
                            onClick={() => setSelection([item.id])}
                            className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                                isSelected ? 'border-lacquer bg-lacquer-soft shadow-sm' : 'border-line hover:border-lacquer/50'
                            }`}
                        >
                            {/* Nút Đổi thứ tự (Z-Index) */}
                            <div className="flex flex-col gap-1 mr-2">
                                <button onClick={(e) => { e.stopPropagation(); moveLayer(item, 'up'); }} className="text-muted hover:text-ink"><ChevronUp className="w-4 h-4" /></button>
                                <button onClick={(e) => { e.stopPropagation(); moveLayer(item, 'down'); }} className="text-muted hover:text-ink"><ChevronDown className="w-4 h-4" /></button>
                            </div>

                            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                <div className="text-muted">
                                    {item.type === 'text' ? <Type className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                                </div>
                                <span className={`text-sm truncate ${item.visible === false ? 'opacity-40 line-through' : ''} ${isSelected ? 'font-semibold text-lacquer' : 'text-ink'}`}>
                                    {item.type === 'text' ? (item.text || 'Văn bản trống') : 'Hình ảnh'}
                                </span>
                            </div>

                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); updateItem(item.id, { locked: !item.locked }); }}
                                    className={`p-1.5 rounded-lg transition-colors ${item.locked ? 'text-lacquer bg-white shadow-sm' : 'text-muted hover:bg-line/50 hover:text-ink'}`}
                                    title={item.locked ? 'Mở khóa' : 'Khóa lớp'}
                                >
                                    {item.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); updateItem(item.id, { visible: item.visible === false ? true : false }); }}
                                    className={`p-1.5 rounded-lg transition-colors ${item.visible === false ? 'text-muted bg-porcelain' : 'text-ink hover:bg-line/50'}`}
                                    title={item.visible === false ? 'Hiện lớp' : 'Ẩn lớp'}
                                >
                                    {item.visible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}