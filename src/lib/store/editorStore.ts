import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// --- TYPE DEFINITIONS ---
export type ItemType = 'text' | 'image' | 'shape';

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
    // Text specific
    content?: string;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
    isGuestName?: boolean;
    // Image specific
    url?: string;
    brightness?: number;
    contrast?: number;
    grayscale?: number;
    imageCrop?: { x: number; y: number; w: number; h: number };
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
    // History & Pages State
    past: Page[][];
    present: Page[];
    future: Page[][];
    
    // Selection & UI State
    currentPageId: string | null;
    selectedIds: string[];
    clipboard: CanvasItem[];
    zoom: number;
    showGrid: boolean;

    // Actions: History
    undo: () => void;
    redo: () => void;
    saveHistory: () => void;

    // Actions: Pages
    initPages: (pages: Page[]) => void;
    addPage: () => void;
    removePage: (pageId: string) => void;
    reorderPages: (activeId: string, overId: string) => void;
    updatePageBackground: (pageId: string, bgType: 'color' | 'image', value: string | null) => void;
    
    // Actions: Items
    addItem: (pageId: string, item: Omit<CanvasItem, 'id' | 'zIndex'>) => void;
    updateItem: (id: string, updates: Partial<CanvasItem>, recordHistory?: boolean) => void;
    updateMultipleItems: (updatesMap: Record<string, Partial<CanvasItem>>, recordHistory?: boolean) => void;
    removeSelectedItems: () => void;
    
    // Actions: Clipboard
    copy: () => void;
    paste: () => void;
    duplicate: () => void;

    // Actions: UI & Selection
    setCurrentPage: (id: string | null) => void;
    setSelection: (ids: string[]) => void;
    setZoom: (zoom: number) => void;
    toggleGrid: () => void;
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

    // --- HISTORY LOGIC ---
    saveHistory: () => set((state) => ({
        past: [...state.past, state.present],
        future: [] // Xóa future khi có thay đổi mới
    })),
    undo: () => set((state) => {
        if (state.past.length === 0) return state;
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, state.past.length - 1);
        return {
            past: newPast,
            present: previous,
            future: [state.present, ...state.future]
        };
    }),
    redo: () => set((state) => {
        if (state.future.length === 0) return state;
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        return {
            past: [...state.past, state.present],
            present: next,
            future: newFuture
        };
    }),

    // --- PAGE LOGIC ---
    initPages: (pages) => set({ present: pages, past: [], future: [], currentPageId: pages[0]?.id || null }),
    
    addPage: () => {
        const state = get();
        const currentRefPage = state.present.find(p => p.id === state.currentPageId) || state.present[state.present.length - 1];
        const newPage: Page = {
            id: uuidv4(),
            name: `Trang ${state.present.length + 1}`,
            canvasWidth: currentRefPage?.canvasWidth || DEFAULT_WIDTH,
            canvasHeight: currentRefPage?.canvasHeight || DEFAULT_HEIGHT,
            backgroundColor: currentRefPage?.backgroundColor || '#ffffff',
            backgroundImage: currentRefPage?.backgroundImage || null,
            items: []
        };
        state.saveHistory();
        set({ present: [...state.present, newPage], currentPageId: newPage.id, selectedIds: [] });
    },

    removePage: (pageId) => {
        const state = get();
        if (state.present.length <= 1) return; // Không xóa trang cuối
        state.saveHistory();
        const newPages = state.present.filter(p => p.id !== pageId);
        set({ present: newPages, currentPageId: newPages[0].id });
    },

    reorderPages: (activeId, overId) => {
        const state = get();
        const oldIndex = state.present.findIndex(p => p.id === activeId);
        const newIndex = state.present.findIndex(p => p.id === overId);
        if (oldIndex === -1 || newIndex === -1) return;
        
        state.saveHistory();
        const newPages = [...state.present];
        const [movedItem] = newPages.splice(oldIndex, 1);
        newPages.splice(newIndex, 0, movedItem);
        set({ present: newPages });
    },

    updatePageBackground: (pageId, bgType, value) => {
        const state = get();
        state.saveHistory();
        set({
            present: state.present.map(p => p.id === pageId 
                ? { ...p, [bgType === 'color' ? 'backgroundColor' : 'backgroundImage']: value } 
                : p
            )
        });
    },

    // --- ITEM LOGIC ---
    addItem: (pageId, itemData) => {
        const state = get();
        state.saveHistory();
        const newItem: CanvasItem = {
            ...itemData,
            id: uuidv4(),
            zIndex: Math.max(0, ...state.present.find(p => p.id === pageId)?.items.map(i => i.zIndex) || [0]) + 1
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

    updateMultipleItems: (updatesMap, recordHistory = true) => {
        const state = get();
        if (recordHistory) state.saveHistory();
        set({
            present: state.present.map(p => ({
                ...p,
                items: p.items.map(i => updatesMap[i.id] ? { ...i, ...updatesMap[i.id] } : i)
            }))
        });
    },

    removeSelectedItems: () => {
        const state = get();
        if (state.selectedIds.length === 0) return;
        
        // Block xóa item đang bị khóa
        const lockedIds = state.present.flatMap(p => p.items).filter(i => state.selectedIds.includes(i.id) && i.locked).map(i => i.id);
        if (lockedIds.length === state.selectedIds.length) return; // Tất cả đều khóa

        const deletableIds = state.selectedIds.filter(id => !lockedIds.includes(id));
        
        state.saveHistory();
        set({
            present: state.present.map(p => ({
                ...p,
                items: p.items.filter(i => !deletableIds.includes(i.id))
            })),
            selectedIds: []
        });
    },

    // --- CLIPBOARD ---
    copy: () => {
        const state = get();
        const selectedItems = state.present.flatMap(p => p.items).filter(i => state.selectedIds.includes(i.id));
        set({ clipboard: selectedItems });
    },
    paste: () => {
        const state = get();
        if (state.clipboard.length === 0 || !state.currentPageId) return;
        state.saveHistory();
        
        const currentPage = state.present.find(p => p.id === state.currentPageId);
        let currentZ = Math.max(0, ...(currentPage?.items.map(i => i.zIndex) || [0])) + 1;
        
        const newItems = state.clipboard.map(item => ({
            ...item,
            id: uuidv4(),
            x: item.x + 20, // Offset nhẹ khi paste
            y: item.y + 20,
            zIndex: currentZ++
        }));

        set({
            present: state.present.map(p => p.id === state.currentPageId ? { ...p, items: [...p.items, ...newItems] } : p),
            selectedIds: newItems.map(i => i.id)
        });
    },
    duplicate: () => {
        const state = get();
        state.copy();
        setTimeout(() => get().paste(), 0);
    },

    // --- UI ---
    setCurrentPage: (id) => set({ currentPageId: id }),
    setSelection: (ids) => set({ selectedIds: ids }),
    setZoom: (zoom) => set({ zoom }),
    toggleGrid: () => set(state => ({ showGrid: !state.showGrid }))
}));