'use client';

// Đưa tài nguyên bổ sung từ server (phần tử, khung, lưới) vào đúng danh sách mà trình thiết kế đang dùng.
// Chỉ thêm mục có mã chưa tồn tại, nên gọi nhiều lần vẫn an toàn.
import { createElement, Fragment, type ReactNode } from 'react';
import { ARTS, ART_BY_CAT, FRAMES, GRIDS, type Art, type ArtCat, type FrameDef, type GridDef } from './editor.data';

export type ServerElementPart = { d: string; tone?: 'main' | 'light' | 'dark' | 'white' };
export type ServerElement = { id: string; name: string; category: ArtCat; group: string; color: string; stroke?: boolean; parts: ServerElementPart[] };
export type ServerFrame = { id: string; name: string; ratio: number; d?: string; radius?: string };
export type ServerGrid = { id: string; name: string; cells: number[][] };

const TONE_STYLE: Record<NonNullable<ServerElementPart['tone']>, { fill: string; fillOpacity?: number }> = {
  main: { fill: 'currentColor' },
  light: { fill: '#ffffff', fillOpacity: 0.35 },
  dark: { fill: '#000000', fillOpacity: 0.22 },
  white: { fill: '#ffffff' },
};

function renderParts(parts: ServerElementPart[]): () => ReactNode {
  return () =>
    createElement(
      Fragment,
      null,
      parts.map((p, i) => {
        const s = TONE_STYLE[p.tone ?? 'main'];
        return createElement('path', { key: i, d: p.d, fill: s.fill, fillOpacity: s.fillOpacity });
      }),
    );
}

export function registerDesignAssets(d: { elements: ServerElement[]; frames: ServerFrame[]; grids: ServerGrid[] }) {
  for (const e of d.elements) {
    if (ARTS.some((a) => a.id === e.id)) continue;
    const art: Art = { id: e.id, name: e.name, cat: e.category, color: e.color, stroke: e.stroke, render: renderParts(e.parts) };
    ARTS.push(art);
    ART_BY_CAT[art.cat].push(art);
  }
  for (const f of d.frames) {
    if (FRAMES.some((x) => x.id === f.id)) continue;
    const def: FrameDef = { id: f.id, name: f.name, ratio: f.ratio, d: f.d, radius: f.radius };
    FRAMES.push(def);
  }
  for (const g of d.grids) {
    if (GRIDS.some((x) => x.id === g.id)) continue;
    const def: GridDef = { id: g.id, name: g.name, cells: g.cells as GridDef['cells'] };
    GRIDS.push(def);
  }
}
