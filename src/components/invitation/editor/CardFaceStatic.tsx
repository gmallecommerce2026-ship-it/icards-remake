// src/components/invitation/editor/CardFaceStatic.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { PAGE } from '../envelope/envelope.data';
import { PageEditor } from './PageEditor';
import { useEditorStore, type PageId } from './useEditorStore';

/**
 * Một mặt của thiệp, chỉ để XEM (không chỉnh sửa được), lấy thẳng từ store.
 * Lấp đầy khung cha có tỉ lệ 5:7 và tự scale từ hệ thiết kế 500×700.
 * Dùng thay cho ảnh chụp canvas: không cần thư viện xuất ảnh, luôn đúng nội dung mới nhất, nét ở mọi kích thước.
 */
export function CardFaceStatic({ pageId = 'cover' }: { pageId?: PageId }) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);
  const bg = useEditorStore((s) => s.backdrops[pageId]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setK(el.clientWidth / PAGE.w);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: bg }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: PAGE.w,
          height: PAGE.h,
          transformOrigin: '0 0',
          transform: `scale(${k || 1})`,
          visibility: k ? 'visible' : 'hidden',
        }}
      >
        <PageEditor pageId={pageId} editable={false} />
      </div>
    </div>
  );
}
