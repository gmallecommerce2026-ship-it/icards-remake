import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface EventSettings {
    invitationType: string;
    groomName: string;
    brideName: string;
    eventDate: string;
    coupleTitle: string;
    coupleSubtitle: string;
    groomImageUrl: string | null;
    brideImageUrl: string | null;
    coupleSeparatorImageUrl: string | null;
}

export interface EventBlock {
    id: string;
    type: string;
}

interface SettingState {
    settings: EventSettings;
    eventBlocks: EventBlock[];
    selectedSettingField: string | null;
    
    updateSetting: (key: keyof EventSettings, value: any) => void;
    setSelectedField: (key: string | null) => void;
    addBlock: (type: string) => void;
    removeBlock: (id: string) => void;
    reorderBlocks: (oldIndex: number, newIndex: number) => void;
}

export const useSettingStore = create<SettingState>((set) => ({
    settings: {
        invitationType: 'Thiệp cưới',
        groomName: 'Tên Chú Rể',
        brideName: 'Tên Cô Dâu',
        eventDate: '',
        coupleTitle: 'Cô Dâu & Chú Rể',
        coupleSubtitle: '... và hai trái tim cùng chung một nhịp đập ...',
        groomImageUrl: null,
        brideImageUrl: null,
        coupleSeparatorImageUrl: null,
    },
    eventBlocks: [
        { id: uuidv4(), type: 'BANNER_CAROUSEL' },
        { id: uuidv4(), type: 'COUPLE_INFO' }
    ],
    selectedSettingField: null,

    updateSetting: (key, value) => set((state) => ({
        settings: { ...state.settings, [key]: value }
    })),

    setSelectedField: (key) => set({ selectedSettingField: key }),

    addBlock: (type) => set((state) => ({
        eventBlocks: [...state.eventBlocks, { id: uuidv4(), type }]
    })),

    removeBlock: (id) => set((state) => ({
        eventBlocks: state.eventBlocks.filter(b => b.id !== id)
    })),

    reorderBlocks: (oldIndex, newIndex) => set((state) => {
        const newBlocks = [...state.eventBlocks];
        const [moved] = newBlocks.splice(oldIndex, 1);
        newBlocks.splice(newIndex, 0, moved);
        return { eventBlocks: newBlocks };
    })
}));