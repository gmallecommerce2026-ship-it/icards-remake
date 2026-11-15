"use client";

import { useEditorStore } from '@/lib/store/useEditorStore';
import { 
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type 
} from 'lucide-react';

const FONT_FAMILIES = ['Be Vietnam Pro', 'Arial', 'Times New Roman', 'Verdana', 'Georgia', 'Tahoma'];
const PRESET_COLORS = ['#1c1a24', '#ffffff', '#a3152f', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export default function TextPropertyEditor() {
    const { present, currentPageId, selectedIds, updateItem } = useEditorStore();
    
    const currentPage = present.find(p => p.id === currentPageId);
    const selectedItem = currentPage?.items.find(i => i.id === selectedIds[0]);

    if (!selectedItem || selectedItem.type !== 'text') return null;

    const toggleStyle = (property: 'fontWeight' | 'fontStyle' | 'textDecoration', activeValue: string, inactiveValue: string) => {
        const currentValue = selectedItem[property];
        updateItem(selectedItem.id, { [property]: currentValue === activeValue ? inactiveValue : activeValue });
    };

    const isStyleActive = (property: keyof typeof selectedItem, value: string) => selectedItem[property] === value;

    return (
        <div className="flex flex-col gap-5 p-5 bg-white border border-line rounded-2xl shadow-sm mt-4">
            <div className="flex items-center gap-2 text-ink font-semibold border-b border-line pb-2">
                <Type className="w-5 h-5 text-lacquer" />
                Định dạng văn bản
            </div>

            {/* Cỡ chữ và Font */}
            <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted">Font chữ</label>
                    <select 
                        value={selectedItem.fontFamily || 'Be Vietnam Pro'}
                        onChange={(e) => updateItem(selectedItem.id, { fontFamily: e.target.value })}
                        className="w-full h-10 px-3 border border-line rounded-lg bg-porcelain outline-none focus:border-lacquer focus:ring-1 focus:ring-lacquer text-sm"
                    >
                        {FONT_FAMILIES.map(font => (
                            <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                        ))}
                    </select>
                </div>
                <div className="w-24 flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted">Cỡ chữ</label>
                    <input 
                        type="number" 
                        min="8" max="200"
                        value={Math.round(selectedItem.fontSize || 32)}
                        onChange={(e) => updateItem(selectedItem.id, { fontSize: Number(e.target.value) })}
                        className="w-full h-10 px-3 border border-line rounded-lg bg-porcelain outline-none focus:border-lacquer focus:ring-1 focus:ring-lacquer text-sm"
                    />
                </div>
            </div>

            {/* Toolbar Định dạng (B, I, U) & Căn lề */}
            <div className="flex items-center justify-between bg-porcelain p-1 rounded-xl border border-line">
                <div className="flex gap-1">
                    <button onClick={() => toggleStyle('fontWeight', 'bold', 'normal')} className={`p-2 rounded-lg transition-colors ${isStyleActive('fontWeight', 'bold') ? 'bg-lacquer-soft text-lacquer' : 'text-muted hover:bg-line/50 hover:text-ink'}`}>
                        <Bold className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleStyle('fontStyle', 'italic', 'normal')} className={`p-2 rounded-lg transition-colors ${isStyleActive('fontStyle', 'italic') ? 'bg-lacquer-soft text-lacquer' : 'text-muted hover:bg-line/50 hover:text-ink'}`}>
                        <Italic className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleStyle('textDecoration', 'underline', 'none')} className={`p-2 rounded-lg transition-colors ${isStyleActive('textDecoration', 'underline') ? 'bg-lacquer-soft text-lacquer' : 'text-muted hover:bg-line/50 hover:text-ink'}`}>
                        <Underline className="w-4 h-4" />
                    </button>
                </div>
                <div className="w-px h-6 bg-line mx-1" />
                <div className="flex gap-1">
                    <button onClick={() => updateItem(selectedItem.id, { textAlign: 'left' })} className={`p-2 rounded-lg transition-colors ${isStyleActive('textAlign', 'left') ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'}`}>
                        <AlignLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => updateItem(selectedItem.id, { textAlign: 'center' })} className={`p-2 rounded-lg transition-colors ${!selectedItem.textAlign || isStyleActive('textAlign', 'center') ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'}`}>
                        <AlignCenter className="w-4 h-4" />
                    </button>
                    <button onClick={() => updateItem(selectedItem.id, { textAlign: 'right' })} className={`p-2 rounded-lg transition-colors ${isStyleActive('textAlign', 'right') ? 'bg-white shadow-sm text-ink' : 'text-muted hover:text-ink'}`}>
                        <AlignRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Bảng Màu Sắc */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted">Màu chữ</label>
                <div className="flex flex-wrap gap-2 items-center">
                    {PRESET_COLORS.map(color => (
                        <button
                            key={color}
                            onClick={() => updateItem(selectedItem.id, { fill: color })}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedItem.fill === color ? 'border-lacquer scale-110 shadow-md' : 'border-line/50'}`}
                            style={{ backgroundColor: color }}
                            title={color}
                        />
                    ))}
                    {/* Native Color Input (Rất nhẹ, không cần thư viện react-color) */}
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-dashed border-line hover:border-lacquer cursor-pointer flex items-center justify-center">
                        <input 
                            type="color" 
                            value={selectedItem.fill || '#000000'}
                            onChange={(e) => updateItem(selectedItem.id, { fill: e.target.value }, false)}
                            onBlur={(e) => updateItem(selectedItem.id, { fill: e.target.value }, true)}
                            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer opacity-0"
                        />
                        <div className="w-full h-full" style={{ backgroundColor: selectedItem.fill || '#000000' }} />
                    </div>
                </div>
            </div>
            
            {/* Tên khách mời Toggle */}
            <div className="pt-2 border-t border-line mt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input 
                            type="checkbox" 
                            className="peer sr-only"
                            checked={selectedItem.isGuestName || false}
                            onChange={(e) => updateItem(selectedItem.id, { isGuestName: e.target.checked })}
                        />
                        <div className="w-10 h-6 bg-line rounded-full peer-checked:bg-lacquer transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </div>
                    <span className="text-sm font-medium text-ink group-hover:text-lacquer transition-colors">Đánh dấu làm Tên khách mời</span>
                </label>
            </div>
        </div>
    );
}