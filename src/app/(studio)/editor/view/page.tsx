// src/app/(studio)/editor/view/page.tsx
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

export default function EditorPage() {
  return (
    <Suspense fallback={null}>
      <Studio />
    </Suspense>
  );
}
