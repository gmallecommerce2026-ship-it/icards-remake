// Thiết kế mẫu thiệp (admin): dùng chung trình studio với trang thiệp của người dùng, nhưng lưu vào mẫu.
// Mở bằng /template-designer?id=<_id mẫu>. Quyền admin do API kiểm tra khi lưu.
'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EnvelopeDesigner } from '@/components/invitation/envelope/EnvelopeDesigner';
import { getAdminTemplate } from '@/lib/api/admin';
import type { InvitationTemplate } from '@/lib/templates';

type Target = { id: string; template: InvitationTemplate };

function Designer() {
  const id = useSearchParams().get('id');
  const [target, setTarget] = useState<Target | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) { setError('Thiếu mã mẫu. Mở lại từ trang Mẫu thiệp trong quản trị.'); return; }
    let alive = true;
    getAdminTemplate(id)
      .then((r) => { if (alive) setTarget({ id: r.data._id, template: r.data }); })
      .catch(() => { if (alive) setError('Không mở được mẫu. Kiểm tra mã mẫu và quyền quản trị.'); });
    return () => { alive = false; };
  }, [id]);

  if (error) {
    return <div className="grid h-dvh place-items-center p-6 text-center text-sm text-[#5B6B7F]">{error}</div>;
  }
  if (!target) {
    return <div className="grid h-dvh place-items-center text-sm text-[#5B6B7F]">Đang tải mẫu…</div>;
  }
  return (
    <>
      <Link
        href="/admin/templates"
        className="fixed left-2 top-2 z-[200] rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#27548A] shadow ring-1 ring-black/10 hover:bg-white"
      >
        ← Quản trị mẫu
      </Link>
      <EnvelopeDesigner key={target.id} editable templateSlug={target.template.slug} adminTemplate={target} />
    </>
  );
}

export default function TemplateDesignerPage() {
  return (
    <Suspense fallback={<div className="grid h-dvh place-items-center text-sm text-[#5B6B7F]">Đang tải…</div>}>
      <Designer />
    </Suspense>
  );
}
