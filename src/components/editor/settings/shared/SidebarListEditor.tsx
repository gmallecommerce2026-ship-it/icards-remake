"use client";

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, ChevronRight } from 'lucide-react';

interface SidebarListEditorProps {
    title: string;
    items: any[];
    onUpdate: (newItems: any[]) => void;
    FormComponent: React.FC<any>;
    defaultNewItem: any;
    renderListItem: (item: any) => React.ReactNode;
}

export default function SidebarListEditor({
    title,
    items,
    onUpdate,
    FormComponent,
    defaultNewItem,
    renderListItem
}: SidebarListEditorProps) {
    const [editingItem, setEditingItem] = useState<any | null>(null);

    const handleEdit = (item: any) => setEditingItem({ ...item });
    
    const handleAddNew = () => setEditingItem({ ...defaultNewItem, id: uuidv4(), isNew: true });
    
    const handleCancel = () => setEditingItem(null);

    const handleSave = () => {
        if (!editingItem) return;
        const { isNew, ...dataToSave } = editingItem;
        let newItems;
        if (isNew) {
            newItems = [...(items || []), dataToSave];
        } else {
            newItems = (items || []).map(item => item.id === dataToSave.id ? dataToSave : item);
        }
        onUpdate(newItems);
        setEditingItem(null);
    };

    const handleRemove = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa mục này không?')) {
            const newItems = items.filter(item => item.id !== editingItem.id);
            onUpdate(newItems);
            setEditingItem(null);
        }
    };

    return (
        <div className="w-full">
            {!editingItem ? (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        {(items || []).map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => handleEdit(item)}
                                className="flex items-center justify-between p-3 border border-line rounded-xl bg-white hover:border-lacquer hover:bg-lacquer-soft transition-colors cursor-pointer group"
                            >
                                <div className="flex-1 overflow-hidden">
                                    {renderListItem(item)}
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted group-hover:text-lacquer" />
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={handleAddNew}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-line text-ink hover:text-lacquer hover:border-lacquer hover:bg-lacquer-soft transition-all font-medium mt-2"
                    >
                        <Plus className="w-5 h-5" /> Thêm {title}
                    </button>
                </div>
            ) : (
                <FormComponent
                    itemData={editingItem}
                    setItemData={setEditingItem}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onRemove={editingItem.isNew ? null : handleRemove}
                />
            )}
        </div>
    );
}