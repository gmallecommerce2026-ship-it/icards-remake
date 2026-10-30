import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU CHUẨN (TYPES)
export type ItemType = 'text' | 'image' | 'rect' | 'circle';

export interface CanvasItem {
    id: string;
    type: ItemType;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    rotation?: number;
    locked?: boolean;
    visible?: boolean;
    
    // Thuộc tính riêng của Text
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fill?: string; // Màu chữ / Màu khối
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
    isGuestName?: boolean;
    
    // Thuộc tính riêng của Image
    src?: string; 
    brightness?: number;
    contrast?: number;
    grayscale?: number;
}

export interface Page {
    id: string;
    name: string;
    canvasWidth: number;
    canvasHeight: number;
    backgroundColor: string;
    backgroundImage: string | null;
    items: CanvasItem[];
}

interface EditorState {
    // History State (Undo/Redo)
    past: Page[][];
    present: Page[];
    future: Page[][];
    
    // UI State
    currentPageId: string | null;
    selectedIds: string[];
    clipboard: CanvasItem[];
    zoom: number;
    showGrid: boolean;

    // Actions
    undo: () => void;
    redo: () => void;
    saveHistory: () => void;
    
    initPages: (pages: Page[]) => void;
    setCurrentPage: (id: string | null) => void;
    setSelection: (ids: string[]) => void;
    setZoom: (zoom: number) => void;
    toggleGrid: () => void;

    // Item Actions
    addItem: (pageId: string, item: Omit<CanvasItem, 'id' | 'zIndex'>) => void;
    updateItem: (id: string, updates: Partial<CanvasItem>, recordHistory?: boolean) => void;
    deleteItems: (ids: string[]) => void;
}

const DEFAULT_WIDTH = 450;
const DEFAULT_HEIGHT = 800;

export const useEditorStore = create<EditorState>((set, get) => ({
    past: [],
    present: [],
    future: [],
    currentPageId: null,
    selectedIds: [],
    clipboard: [],
    zoom: 1,
    showGrid: false,

    // --- UNDO / REDO LOGIC ---
    saveHistory: () => set((state) => ({
        past: [...state.past, state.present],
        future: [] 
    })),
    undo: () => set((state) => {
        if (state.past.length === 0) return state;
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, state.past.length - 1);
        return { past: newPast, present: previous, future: [state.present, ...state.future] };
    }),
    redo: () => set((state) => {
        if (state.future.length === 0) return state;
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        return { past: [...state.past, state.present], present: next, future: newFuture };
    }),

    // --- CÁC HÀM XỬ LÝ TRANG & LỰA CHỌN ---
    initPages: (pages) => set({ present: pages, past: [], future: [], currentPageId: pages[0]?.id || null }),
    setCurrentPage: (id) => set({ currentPageId: id }),
    setSelection: (ids) => set({ selectedIds: ids }),
    setZoom: (zoom) => set({ zoom }),
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

    // --- CÁC HÀM XỬ LÝ CANVAS ITEMS ---
    addItem: (pageId, itemData) => {
        const state = get();
        state.saveHistory();
        
        const currentPage = state.present.find(p => p.id === pageId);
        if (!currentPage) return;

        const maxZ = Math.max(0, ...currentPage.items.map(i => i.zIndex));
        const newItem: CanvasItem = {
            ...itemData,
            id: uuidv4(),
            zIndex: maxZ + 1
        };

        set({
            present: state.present.map(p => p.id === pageId ? { ...p, items: [...p.items, newItem] } : p),
            selectedIds: [newItem.id]
        });
    },

    updateItem: (id, updates, recordHistory = true) => {
        const state = get();
        if (recordHistory) state.saveHistory();
        
        set({
            present: state.present.map(p => ({
                ...p,
                items: p.items.map(i => i.id === id ? { ...i, ...updates } : i)
            }))
        });
    },

    deleteItems: (ids) => {
        const state = get();
        if (ids.length === 0) return;
        state.saveHistory();
        
        set({
            present: state.present.map(p => ({
                ...p,
                items: p.items.filter(i => !ids.includes(i.id))
            })),
            selectedIds: state.selectedIds.filter(id => !ids.includes(id))
        });
    }
}));