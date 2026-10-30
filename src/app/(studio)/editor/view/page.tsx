// src/app/(studio)/editor/view/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EnvelopeDesigner } from '@/components/invitation/envelope/EnvelopeDesigner';

function Studio() {
  const slug = useSearchParams().get('template');
  return <EnvelopeDesigner key={slug ?? 'blank'} editable templateSlug={slug} />;
}

export default function EditorPage() {
  return (
    <Suspense fallback={null}>
      <Studio />
    </Suspense>
  );
}
