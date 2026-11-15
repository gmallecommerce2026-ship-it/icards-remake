// Thiết kế mẫu thiệp (admin): cùng màn hình studio với trang thiệp của người dùng, nhưng lưu vào mẫu.
// Nằm dưới /admin để đi qua AdminGate (chỉ role=admin). Mở bằng /admin/templates/design?id=<_id mẫu>.
// Phủ toàn màn hình (fixed inset-0) để che khung quản trị, giao diện giống hệt studio.
'use client';

import { Suspense, useEffect, useState } from 'react';
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
    if (!id) { setError('Thiếu mã mẫu. Mở lại từ trang Thiết kế mẫu trong quản trị.'); return; }
    let alive = true;
    getAdminTemplate(id)
      .then((r) => { if (alive) setTarget({ id: r.data._id, template: r.data }); })
      .catch(() => { if (alive) setError('Không mở được mẫu. Kiểm tra mã mẫu và quyền quản trị.'); });
    return () => { alive = false; };
  }, [id]);

  const shell = 'fixed inset-0 z-[100] overflow-auto bg-white';
  if (error) {
    return <div className={`${shell} grid place-items-center p-6 text-center text-sm text-[#5B6B7F]`}>{error}</div>;
  }
  if (!target) {
    return <div className={`${shell} grid place-items-center text-sm text-[#5B6B7F]`}>Đang tải mẫu…</div>;
  }
  return (
    <div className={shell}>
      <EnvelopeDesigner key={target.id} editable templateSlug={target.template.slug} adminTemplate={target} exitHref="/admin/templates" exitLabel="Quay lại thiết kế mẫu" />
    </div>
  );
}

export default function AdminTemplateDesignPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 z-[100] grid place-items-center bg-white text-sm text-[#5B6B7F]">Đang tải…</div>}>
      <Designer />
    </Suspense>
  );
}
