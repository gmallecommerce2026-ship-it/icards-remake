"use client";
import { useId } from 'react';
import { useSettingStore } from '@/lib/store/useSettingStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AVAILABLE_BLOCKS } from '@/lib/config/blocks';
import SortableBlockItem from './SortableBlockItem';
import { Plus } from 'lucide-react';

export default function BlockManagerPanel() {
    const { eventBlocks, selectedSettingField, setSelectedField, reorderBlocks, removeBlock, addBlock } = useSettingStore();
    const dndId = useId();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            reorderBlocks(active.id as string, over.id as string);
        }
    };

    const handleSelectBlock = (blockType: string) => {
        const config = AVAILABLE_BLOCKS[blockType];
        if (config) {
            const keyToSelect = config.titleKey || config.key || (config.relatedFields && config.relatedFields[0]);
            if (keyToSelect) {
                setSelectedField(keyToSelect);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-line w-[340px] shrink-0 shadow-sm">
            <div className="p-4 border-b border-line flex items-center justify-between">
                <h3 className="font-bold text-ink text-lg">Quản lý khối</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
                <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={eventBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        {eventBlocks.map((block) => {
                            const config = AVAILABLE_BLOCKS[block.type];
                            // Kiểm tra xem block này có đang được active (edit) không
                            const isSelected = config && (
                                config.key === selectedSettingField || 
                                config.titleKey === selectedSettingField ||
                                config.relatedFields?.includes(selectedSettingField)
                            );

                            return (
                                <SortableBlockItem
                                    key={block.id}
                                    id={block.id}
                                    type={block.type}
                                    isSelected={!!isSelected}
                                    onSelectBlock={handleSelectBlock}
                                    onRemoveBlock={removeBlock}
                                />
                            );
                        })}
                    </SortableContext>
                </DndContext>

                {/* Bỏ UI Select Box thêm khối ở đây, thay bằng Nút Mở Modal (tùy chọn UI của bạn) */}
                <button 
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-line text-muted hover:text-lacquer hover:border-lacquer hover:bg-lacquer-soft transition-all font-medium"
                    onClick={() => {
                        // TODO: Mở Modal chọn Block mới
                        // Tạm thời gọi hàm addBlock('CUSTOM_HTML') để test
                        addBlock('CUSTOM_HTML');
                    }}
                >
                    <Plus className="w-5 h-5" /> Thêm khối mới
                </button>
            </div>
        </div>
    );
}