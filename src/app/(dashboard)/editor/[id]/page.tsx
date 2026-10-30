"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import BlockManagerPanel from '@/components/editor/settings/BlockManagerPanel';
import LayersPanel from '@/components/editor/settings/properties/LayersPanel';
import TextPropertyEditor from '@/components/editor/settings/properties/TextPropertyEditor';
import { useEditorStore } from '@/lib/store/useEditorStore';
import EditorHeader from '@/components/editor/EditorHeader';
import EditorSidebar from '@/components/editor/EditorSidebar';

// Import động Canvas để vô hiệu hóa SSR, ngăn lỗi "window is not defined" của Konva
const DynamicCanvasWorkspace = dynamic(
  () => import('@/components/editor/canvas/Workspace'),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex h-full items-center justify-center text-muted font-medium bg-[#F7F8FB]">
        Đang tải không gian làm việc...
      </div>
    ) 
  }
);

export default function InvitationEditorPage() {
  // Lấy state từ Zustand để biết người dùng có đang click vào vật thể nào trên Canvas không
  const { selectedIds, present, currentPageId } = useEditorStore();
  
  const currentPage = present.find(p => p.id === currentPageId);
  const selectedItem = currentPage?.items.find(i => i.id === selectedIds[0]);

  // State cục bộ cho Header (có thể chuyển vào Zustand nếu muốn đồng bộ gọi API lưu)
  const [slug, setSlug] = useState('thiep-cuoi-thien-an');

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col overflow-hidden bg-porcelain text-ink font-sans">
      
      {/* 1. TOP BAR: Thanh công cụ lưu trữ & lịch sử */}
      <EditorHeader slug={slug} setSlug={setSlug} />

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* 2. LEFT SIDEBAR: Chứa các nút Thêm Văn bản, Upload Ảnh */}
        <EditorSidebar />

        {/* 3. MAIN WORKSPACE: Khu vực vẽ Canvas ở giữa */}
        <main className="flex-1 relative overflow-hidden flex flex-col">
          <DynamicCanvasWorkspace />
        </main>

        {/* 4. RIGHT PANEL: Bảng thuộc tính động */}
        <aside className="w-[340px] shrink-0 bg-white border-l border-line flex flex-col h-full overflow-hidden shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-20">
          
          {selectedItem ? (
            // Trạng thái A: Đang chọn 1 vật thể trên Canvas -> Hiện bảng Properties & Layers
            <div className="flex flex-col h-full overflow-y-auto bg-porcelain/30 p-4 gap-4 custom-scrollbar">
              {selectedItem.type === 'text' && <TextPropertyEditor />}
              {/* Nếu là image, bạn có thể render <ImagePropertyEditor /> ở đây */}
              <LayersPanel />
            </div>
          ) : (
            // Trạng thái B: Click ra ngoài Canvas (không chọn gì) -> Hiện trình quản lý Khối Sự Kiện
            <BlockManagerPanel />
          )}

        </aside>
      </div>
      
    </div>
  );
}