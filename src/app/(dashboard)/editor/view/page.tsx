// src/app/(dashboard)/editor/view/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import type Konva from 'konva';
import { useEditorStore } from '@/components/invitation/editor/useEditorStore';

// Konva cần window → tắt SSR
const CardCanvas = dynamic(() => import('@/components/invitation/editor/CardCanvas').then((m) => m.CardCanvas), { ssr: false });

export default function EditorPage() {
  const stage = useRef<Konva.Stage>(null);
  const router = useRouter();
  const { add, remove, selectedId, setPreview } = useEditorStore();

  const addText = () => add({ type: 'text', x: 80, y: 80, rotation: 0, text: 'Bạn được mời', fontSize: 40, fill: '#3b2a20', fontFamily: 'Georgia', width: 440 });
  const addImage = (f?: File) => f && add({ type: 'image', x: 100, y: 120, rotation: 0, src: URL.createObjectURL(f), width: 200, height: 200 });
  const preview = () => {
    if (!stage.current) return;
    setPreview(stage.current.toDataURL({ pixelRatio: 2 }));
    router.push('/my-events/view');
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="flex gap-2">
        <button onClick={addText}>Thêm chữ</button>
        <label>Thêm ảnh<input type="file" accept="image/*" hidden onChange={(e) => addImage(e.target.files?.[0])} /></label>
        <button disabled={!selectedId} onClick={() => selectedId && remove(selectedId)}>Xóa</button>
        <button onClick={preview}>Xem thử với phong bì</button>
      </div>
      <CardCanvas ref={stage} />
    </div>
  );
}