"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ExternalLink, Plus } from "lucide-react";
import * as adminApi from "@/lib/api/admin";
import type { BannerGroupData, BannerItemData, BannerPage, BannerSlot } from "@/lib/banner-groups";
import { ErrorBox, PageTitle, btnCls, btnGhostCls, errorMessage } from "@/components/admin/ui";
import { GroupCard } from "./GroupCard";
import { PAGE_META, SLOT_META, newGroup, replaceSubset } from "./helpers";

/* Quản lý banner: chọn trang, rồi sắp các nhóm ở đầu trang / cuối trang. Mỗi nhóm có một bố cục và số banner không giới hạn. */
export default function BannerAdmin() {
  const [groups, setGroups] = useState<BannerGroupData[] | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [page, setPage] = useState<BannerPage>("home");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty = groups !== null && JSON.stringify(groups) !== savedSnapshot;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    adminApi
      .getAdminSettings()
      .then(({ data }) => {
        const list = data.bannerGroups ?? [];
        setGroups(list);
        setSavedSnapshot(JSON.stringify(list));
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

  // Cảnh báo khi rời trang mà chưa lưu
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!groups) {
    return <>{error ? <ErrorBox>{error}</ErrorBox> : <p className="text-sm text-[#5B6B7F]">Đang tải…</p>}</>;
  }

  const slotGroups = (slot: BannerSlot) => groups.filter((g) => g.page === page && g.slot === slot);

  const updateAll = (fn: (all: BannerGroupData[]) => BannerGroupData[]) => setGroups((all) => (all ? fn(all) : all));

  const patchGroup = (id: string, patch: Partial<BannerGroupData>) =>
    updateAll((all) => all.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const setGroupBanners = (id: string, banners: BannerItemData[]) =>
    updateAll((all) => all.map((g) => (g.id === id ? { ...g, banners } : g)));

  const removeGroup = (id: string) => updateAll((all) => all.filter((g) => g.id !== id));

  /* Chuyển banner sang nhóm khác (cùng trang), đặt cuối nhóm đích. */
  const moveBanner = (fromId: string, bannerId: string, toId: string) =>
    updateAll((all) => {
      const banner = all.find((g) => g.id === fromId)?.banners.find((b) => b.id === bannerId);
      if (!banner || fromId === toId) return all;
      return all.map((g) => {
        if (g.id === fromId) return { ...g, banners: g.banners.filter((b) => b.id !== bannerId) };
        if (g.id === toId) return { ...g, banners: [...g.banners, banner] };
        return g;
      });
    });

  const addGroup = (slot: BannerSlot) =>
    updateAll((all) => [...all, newGroup(page, slot, all.filter((g) => g.page === page && g.slot === slot).length)]);

  const onGroupDragEnd = (slot: BannerSlot) => (e: DragEndEvent) => {
    const { active, over } = e;
    const list = slotGroups(slot);
    if (!over || active.id === over.id) return;
    const from = list.findIndex((g) => g.id === active.id);
    const to = list.findIndex((g) => g.id === over.id);
    const next = arrayMove(list, from, to);
    updateAll((all) => replaceSubset(all, (g) => g.page === page && g.slot === slot, next));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const { data } = await adminApi.saveAdminBannerGroups(groups);
      const saved = data.bannerGroups ?? [];
      setGroups(saved);
      setSavedSnapshot(JSON.stringify(saved));
      setMessage("Đã lưu. Trang công khai cập nhật sau tối đa 1 phút.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const meta = PAGE_META[page];

  return (
    <>
      <PageTitle
        title="Banner"
        description="Chọn trang, sau đó thêm nhóm banner ở đầu trang hoặc cuối trang. Mỗi nhóm có một bố cục riêng."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <a href={meta.path} target="_blank" rel="noreferrer" className={btnGhostCls}>
              <ExternalLink className="mr-1.5 size-3.5" />
              Xem trang {meta.label.toLowerCase()}
            </a>
            <span className={`text-sm ${dirty ? "font-medium text-[#8A5A00]" : "text-[#5B6B7F]"}`}>
              {dirty ? "Có thay đổi chưa lưu" : "Đã lưu"}
            </span>
            <button type="button" className={btnCls} disabled={saving || !dirty} onClick={save}>
              {saving ? "Đang lưu…" : "Lưu thay đổi"}
            </button>
          </div>
        }
      />

      {error && <ErrorBox>{error}</ErrorBox>}
      {message && <p className="mb-4 text-sm text-[#1E7A4C]">{message}</p>}

      <div role="tablist" aria-label="Trang" className="mb-6 flex flex-wrap gap-2 border-b border-[#D9E1EC]">
        {(Object.keys(PAGE_META) as BannerPage[]).map((key) => {
          const active = key === page;
          const count = groups.filter((g) => g.page === key).length;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setPage(key)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                active ? "border-[#27548A] text-[#27548A]" : "border-transparent text-[#5B6B7F] hover:text-[#222]"
              }`}
            >
              {PAGE_META[key].label}
              <span className="ml-2 rounded-sm bg-[#F3F6FA] px-1.5 py-0.5 text-xs font-medium text-[#5B6B7F]">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-10">
        {meta.slots.map((slot) => {
          const list = slotGroups(slot);
          return (
            <section key={slot} aria-label={SLOT_META[slot].label} className="grid gap-4">
              <div>
                <h2 className="text-lg font-bold">{SLOT_META[slot].label}</h2>
                <p className="text-sm text-[#5B6B7F]">{SLOT_META[slot].hint} Nhóm xếp từ trên xuống theo thứ tự bên dưới.</p>
              </div>

              {list.length === 0 && <p className="rounded-md border border-dashed border-[#C5D0DE] p-6 text-center text-sm text-[#5B6B7F]">Chưa có nhóm nào ở vị trí này.</p>}

              <DndContext id={`groups-${page}-${slot}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onGroupDragEnd(slot)}>
                <SortableContext items={list.map((g) => g.id)} strategy={verticalListSortingStrategy}>
                  <div className="grid gap-5">
                    {list.map((g) => (
                      <GroupCard
                        key={g.id}
                        group={g}
                        onPatch={(patch) => patchGroup(g.id, patch)}
                        onBanners={(banners) => setGroupBanners(g.id, banners)}
                        onRemove={() => removeGroup(g.id)}
                        moveTargets={groups
                          .filter((x) => x.page === page && x.id !== g.id)
                          .map((x) => ({ id: x.id, name: `${x.name} (${SLOT_META[x.slot].label.toLowerCase()})` }))}
                        onMoveBanner={(bannerId, toId) => moveBanner(g.id, bannerId, toId)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div>
                <button type="button" className={btnGhostCls} onClick={() => addGroup(slot)}>
                  <Plus className="mr-1.5 size-3.5" />
                  Thêm nhóm {SLOT_META[slot].label.toLowerCase()}
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
