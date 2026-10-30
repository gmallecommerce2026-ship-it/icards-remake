"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2 } from 'lucide-react';
import { AVAILABLE_BLOCKS } from '@/lib/config/blocks';

interface SortableBlockItemProps {
    id: string;
    type: string;
    isSelected: boolean;
    onSelectBlock: (type: string) => void;
    onRemoveBlock: (id: string) => void;
}

export default function SortableBlockItem({ id, type, isSelected, onSelectBlock, onRemoveBlock }: SortableBlockItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const config = AVAILABLE_BLOCKS[type] || {};

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 30 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative mb-3 flex items-center justify-between rounded-xl border p-3 transition-all ${
                isDragging 
                    ? 'border-lacquer bg-white shadow-xl opacity-90' 
                    : isSelected 
                        ? 'border-lacquer bg-lacquer-soft shadow-sm' 
                        : 'border-line bg-white hover:border-lacquer/50'
            }`}
        >
            <div className="flex items-center gap-3">
                {/* Nút kéo thả */}
                <div 
                    {...attributes} 
                    {...listeners} 
                    className="cursor-grab active:cursor-grabbing text-muted hover:text-ink p-1 -ml-1 rounded"
                >
                    <GripVertical className="w-5 h-5" />
                </div>
                
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${isSelected ? 'bg-lacquer text-white' : 'bg-porcelain text-muted'}`}>
                    {config.icon}
                </div>
                
                <span className={`font-medium ${isSelected ? 'text-lacquer' : 'text-ink'}`}>
                    {config.label}
                </span>
            </div>

            {/* Thanh công cụ (Hiện khi hover hoặc đang được chọn) */}
            <div className={`flex items-center gap-1 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                <button
                    onClick={(e) => { e.stopPropagation(); onSelectBlock(type); }}
                    className="p-2 text-muted hover:text-lacquer hover:bg-lacquer-soft rounded-lg transition-colors"
                    title={config.isList ? 'Chỉnh sửa danh sách' : 'Chỉnh sửa nội dung'}
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onRemoveBlock(id); }}
                    className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa khối này"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}