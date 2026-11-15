"use client";

import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { BANNER_LAYOUTS, type BannerGroupData, type BannerItemData, type BannerLayout } from "@/lib/banner-groups";
import { inputCls, btnGhostCls } from "@/components/admin/ui";
import { BannerEditor } from "./BannerEditor";
import { LayoutPicker } from "./Wireframe";
import { newBanner, positionLabel } from "./helpers";

function BannerRow({
  b,
  index,
  layout,
  open,
  onToggleOpen,
  onChange,
  onRemove,
  moveTargets,
  onMove,
}: {
  b: BannerItemData;
  index: number;
  layout: BannerLayout;
  open: boolean;
  onToggleOpen: () => void;
  onChange: (patch: Partial<BannerItemData>) => void;
  onRemove: () => void;
  moveTargets: { id: string; name: string }[];
  onMove: (groupId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: b.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-md border bg-white ${isDragging ? "border-[#27548A] shadow-lg" : "border-[#D9E1EC]"} ${b.isEnabled ? "" : "opacity-60"}`}
    >
      <div className="flex flex-wrap items-center gap-3 p-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Kéo để đổi thứ tự banner"
          className="cursor-grab touch-none rounded p-1 text-[#5B6B7F] hover:text-[#27548A] active:cursor-grabbing"
        >
          <GripVertical className="size-5" />
        </button>
        <div
          className="h-12 w-20 shrink-0 overflow-hidden rounded-sm bg-[#0E1B2C] bg-cover bg-center"
          style={b.imgSrc ? { backgroundImage: `url("${b.imgSrc}")` } : undefined}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{b.title || b.name}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#5B6B7F]">
            <span className="rounded-sm bg-[#EEF4FB] px-2 py-0.5 font-medium text-[#27548A]">{positionLabel(layout, index)}</span>
            {!b.link && <span>Không có liên kết</span>}
            {!b.isEnabled && <span className="text-[#8E2B3B]">Đang tắt</span>}
          </p>
        </div>
        <button type="button" className={btnGhostCls} onClick={onToggleOpen} aria-expanded={open}>
          <Pencil className="mr-1.5 size-3.5" />
          {open ? "Thu gọn" : "Sửa"}
        </button>
      </div>
      {open && <BannerEditor banner={b} onChange={onChange} onRemove={onRemove} moveTargets={moveTargets} onMove={onMove} />}
    </div>
  );
}

export function GroupCard({
  group,
  onPatch,
  onBanners,
  onRemove,
  moveTargets,
  onMoveBanner,
}: {
  group: BannerGroupData;
  onPatch: (patch: Partial<BannerGroupData>) => void;
  onBanners: (next: BannerItemData[]) => void;
  onRemove: () => void;
  moveTargets: { id: string; name: string }[];
  onMoveBanner: (bannerId: string, targetGroupId: string) => void;
}) {
  const sortable = useSortable({ id: group.id });
  const [openId, setOpenId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const spec = BANNER_LAYOUTS[group.layout];
  const enabledCount = group.banners.filter((b) => b.isEnabled).length;

  const patchBanner = (id: string, patch: Partial<BannerItemData>) =>
    onBanners(group.banners.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const removeBanner = (id: string) => {
    if (!window.confirm("Xoá banner này khỏi nhóm?")) return;
    onBanners(group.banners.filter((b) => b.id !== id));
    if (openId === id) setOpenId(null);
  };

  const addBanner = () => {
    const b = newBanner();
    onBanners([...group.banners, b]);
    setOpenId(b.id);
  };

  const onBannerDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = group.banners.findIndex((b) => b.id === active.id);
    const to = group.banners.findIndex((b) => b.id === over.id);
    onBanners(arrayMove(group.banners, from, to));
  };

  const removeGroup = () => {
    if (!window.confirm(`Xoá nhóm "${group.name}" và toàn bộ ${group.banners.length} banner trong nhóm?`)) return;
    onRemove();
  };

  return (
    <div
      ref={sortable.setNodeRef}
      style={{ transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition }}
      className={`rounded-lg border bg-white ${sortable.isDragging ? "border-[#27548A] shadow-xl" : "border-[#D9E1EC]"} ${group.isEnabled ? "" : "opacity-70"}`}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-[#E3E9F2] p-4">
        <button
          type="button"
          {...sortable.attributes}
          {...sortable.listeners}
          aria-label="Kéo để đổi thứ tự nhóm"
          className="cursor-grab touch-none rounded p-1 text-[#5B6B7F] hover:text-[#27548A] active:cursor-grabbing"
        >
          <GripVertical className="size-5" />
        </button>
        <input
          className={`${inputCls} min-w-[200px] flex-1 font-semibold`}
          aria-label="Tên nhóm"
          value={group.name}
          onChange={(e) => onPatch({ name: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" className="size-4" checked={group.isEnabled} onChange={(e) => onPatch({ isEnabled: e.target.checked })} />
          Hiển thị nhóm
        </label>
        <span className="rounded-sm bg-[#F3F6FA] px-2.5 py-1 text-xs font-medium text-[#5B6B7F]">
          {enabledCount}/{group.banners.length} banner đang bật
        </span>
        <button type="button" className={`${btnGhostCls} text-[#8E2B3B]`} onClick={removeGroup}>
          <Trash2 className="mr-1.5 size-3.5" />
          Xoá nhóm
        </button>
      </div>

      <div className="grid gap-6 p-4">
        <section className="grid gap-3">
          <h3 className="text-sm font-semibold">1. Chọn bố cục</h3>
          <LayoutPicker value={group.layout} onChange={(layout) => onPatch({ layout })} />
        </section>

        <section className="grid gap-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">2. Banner trong nhóm</h3>
              <p className="mt-0.5 text-xs text-[#5B6B7F]">
                {spec.spans.length > 1
                  ? `Bố cục này xếp theo cụm ${spec.spans.length} banner. Nên có 3, 6, 9… banner để các hàng đầy đủ.`
                  : "Kéo ▸ để đổi thứ tự. Số banner không giới hạn."}
              </p>
            </div>
            <button type="button" className={btnGhostCls} onClick={addBanner}>
              <Plus className="mr-1.5 size-3.5" />
              Thêm banner
            </button>
          </div>

          {enabledCount === 0 && (
            <p className="rounded-md bg-[#FFF6E5] px-3 py-2 text-xs text-[#8A5A00]">
              Nhóm chưa có banner nào đang bật, nên sẽ không hiển thị ngoài trang chủ.
            </p>
          )}

          {group.banners.length === 0 ? (
            <p className="rounded-md border border-dashed border-[#C5D0DE] p-6 text-center text-sm text-[#5B6B7F]">
              Chưa có banner. Bấm &quot;Thêm banner&quot; để bắt đầu.
            </p>
          ) : (
            <DndContext id={`banners-${group.id}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onBannerDragEnd}>
              <SortableContext items={group.banners.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="grid gap-2">
                  {group.banners.map((b, i) => (
                    <BannerRow
                      key={b.id}
                      b={b}
                      index={i}
                      layout={group.layout}
                      open={openId === b.id}
                      onToggleOpen={() => setOpenId(openId === b.id ? null : b.id)}
                      onChange={(patch) => patchBanner(b.id, patch)}
                      onRemove={() => removeBanner(b.id)}
                      moveTargets={moveTargets}
                      onMove={(toId) => onMoveBanner(b.id, toId)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </section>
      </div>
    </div>
  );
}
