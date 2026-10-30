"use client";

import { useState } from 'react';
import { 
    Copy, Palette, PlusCircle, Type, Users, 
    UploadCloud, Image as ImageIcon, BoxSelect, 
    Tags, PlayCircle, ChevronLeft 
} from 'lucide-react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import IntegratedSidebarPanel from './layout/IntegratedSidebarPanel';

// Component Nút Rail chuẩn iCards
function RailButton({ 
    icon, label, selected, onClick 
}: { 
    icon: React.ReactNode; label: string; selected?: boolean; onClick: () => void 
}) {
    return (
        <button
            onClick={onClick}
            className={`group flex flex-col items-center gap-1.5 p-2 w-full transition-colors focus-visible:outline-none ${
                selected ? 'text-lacquer' : 'text-muted hover:text-lacquer'
            }`}
        >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105 group-active:scale-95 ${
                selected ? 'bg-lacquer-soft' : 'bg-porcelain group-hover:bg-lacquer-soft'
            }`}>
                {icon}
            </div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-center w-full truncate px-1">
                {label}
            </span>
        </button>
    );
}

export default function EditorSidebar() {
    // State quản lý Sidebar
    const [activeTool, setActiveTool] = useState('pages');
    const [panelOpen, setPanelOpen] = useState(true);

    const { addItem, currentPageId } = useEditorStore();

    const handleToolClick = (tool: string) => {
        // Cơ chế giống Canva: Bấm lại tool đang mở thì thu gọn Panel
        if (activeTool === tool && panelOpen) {
            setPanelOpen(false);
        } else {
            setActiveTool(tool);
            setPanelOpen(true);
        }
    };

    const handleAddItem = (type: 'text' | 'image', content: string, isGuestName = false) => {
        if (!currentPageId) {
            alert("Vui lòng tạo hoặc chọn một trang trước khi thêm đối tượng!");
            return;
        }
        
        if (type === 'text') {
            addItem(currentPageId, {
                type: 'text',
                x: 100, y: 150,
                width: 250, height: 50,
                text: content,
                fontSize: 32,
                fill: '#1c1a24',
                isGuestName: isGuestName
            });
        }
    };

    return (
        <div className="flex h-full flex-shrink-0 z-20 relative">
            
            {/* 1. PRIMARY RAIL (88px) */}
            <div className="w-[88px] h-full flex flex-col items-center gap-1 py-4 border-r border-line bg-white overflow-y-auto custom-scrollbar relative z-30">
                <RailButton icon={<Copy className="w-5 h-5" />} label="Trang" selected={activeTool === 'pages'} onClick={() => handleToolClick('pages')} />
                <RailButton icon={<Palette className="w-5 h-5" />} label="Mẫu" selected={activeTool === 'templates'} onClick={() => handleToolClick('templates')} />
                <RailButton icon={<PlusCircle className="w-5 h-5" />} label="Tạo mới" selected={activeTool === 'create'} onClick={() => handleToolClick('create')} />
                
                <div className="w-10 h-px bg-line/60 my-2 shrink-0" />
                
                <RailButton icon={<Type className="w-5 h-5" />} label="Văn bản" onClick={() => handleAddItem('text', 'Nội dung mới')} />
                <RailButton icon={<Users className="w-5 h-5" />} label="Tên khách" onClick={() => handleAddItem('text', '[Tên Khách Mời]', true)} />
                <RailButton icon={<UploadCloud className="w-5 h-5" />} label="Tải lên" selected={activeTool === 'upload'} onClick={() => handleToolClick('upload')} />
                <RailButton icon={<ImageIcon className="w-5 h-5" />} label="Icon" selected={activeTool === 'icons'} onClick={() => handleToolClick('icons')} />
                <RailButton icon={<BoxSelect className="w-5 h-5" />} label="Thành phần" selected={activeTool === 'components'} onClick={() => handleToolClick('components')} />
                <RailButton icon={<Tags className="w-5 h-5" />} label="Tag/Khung" selected={activeTool === 'tags'} onClick={() => handleToolClick('tags')} />

                <div className="w-10 h-px bg-line/60 my-2 shrink-0" />

                <RailButton icon={<PlayCircle className="w-5 h-5" />} label="Nhạc nền" selected={activeTool === 'music'} onClick={() => handleToolClick('music')} />
            </div>

            {/* 2. SECONDARY PANEL (340px) - Mở rộng/Thu gọn */}
            <div 
                className={`h-full bg-white border-r border-line shadow-[4px_0_15px_rgba(0,0,0,0.03)] transition-all duration-300 ease-in-out relative z-20 overflow-hidden ${
                    panelOpen ? 'w-[340px]' : 'w-0 border-none'
                }`}
            >
                <div className="w-[340px] h-full">
                    {/* Render Panel tương ứng với activeTool */}
                    {activeTool === 'pages' && <IntegratedSidebarPanel />}
                    {activeTool === 'upload' && <div className="p-4">Tính năng Tải lên (Đang code...)</div>}
                    {/* Các panel khác thêm vào đây */}
                </div>
                
                {/* Nút Đóng Panel */}
                <button 
                    onClick={() => setPanelOpen(false)}
                    className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-12 bg-white border border-line rounded-r-lg shadow-sm flex items-center justify-center text-muted hover:text-lacquer z-50 cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}