// src/app/(studio)/invitation-management/my-events/view/page.tsx
// Trang thiết kế thiệp toàn màn hình (không sidebar). Đọc mẫu từ ?template=<slug>.
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EnvelopeDesigner } from '@/components/invitation/envelope/EnvelopeDesigner';

function Studio() {
  const sp = useSearchParams();
  const slug = sp.get('template');
  const invitationId = sp.get('invitation');
  return <EnvelopeDesigner key={`${slug ?? 'blank'}:${invitationId ?? 'new'}`} editable templateSlug={slug} invitationId={invitationId} />;
}

export default function MyEventPreviewPage() {
  return (
    <Suspense fallback={<div style={{ display: 'grid', placeItems: 'center', height: '100dvh' }}>Đang tải trình thiết kế…</div>}>
      <Studio />
    </Suspense>
  );
}
