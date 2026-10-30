// src/app/(dashboard)/my-events/view/page.tsx
'use client';

import { EnvelopeScene } from '@/components/invitation/envelope/EnvelopeScene';
import { useEditorStore } from '@/components/invitation/editor/useEditorStore';

export default function MyEventPreviewPage() {
  const previewUrl = useEditorStore((s) => s.previewUrl);
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <EnvelopeScene width={480}>
        {previewUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={previewUrl} alt="Thiệp mời" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>Chưa có thiết kế</div>}
      </EnvelopeScene>
    </div>
  );
}