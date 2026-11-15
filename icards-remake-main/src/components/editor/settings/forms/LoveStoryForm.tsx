"use client";

import ImageUploadField from '../shared/ImageUploadField';

interface LoveStoryFormProps {
    itemData: any;
    setItemData: React.Dispatch<React.SetStateAction<any>>;
    onSave: () => void;
    onCancel: () => void;
    onRemove: (() => void) | null;
}

export default function LoveStoryForm({ itemData, setItemData, onSave, onCancel, onRemove }: LoveStoryFormProps) {
    return (
        <div className="flex flex-col gap-4 p-4 border border-line rounded-xl bg-white shadow-sm">
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Tiêu đề cột mốc</label>
                <input
                    type="text"
                    value={itemData.title || ''}
                    onChange={(e) => setItemData((prev: any) => ({ ...prev, title: e.target.value }))}
                    placeholder="Ví dụ: Ngày đầu gặp gỡ"
                    className="w-full px-3 py-2 border border-line rounded-lg bg-porcelain outline-none focus:border-lacquer focus:ring-1 focus:ring-lacquer text-sm"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Thời gian</label>
                <input
                    type="text"
                    value={itemData.date || ''}
                    onChange={(e) => setItemData((prev: any) => ({ ...prev, date: e.target.value }))}
                    placeholder="Ví dụ: Ngày 12 tháng 12, 2022"
                    className="w-full px-3 py-2 border border-line rounded-lg bg-porcelain outline-none focus:border-lacquer focus:ring-1 focus:ring-lacquer text-sm"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink">Mô tả câu chuyện</label>
                <textarea
                    value={itemData.description || ''}
                    onChange={(e) => setItemData((prev: any) => ({ ...prev, description: e.target.value }))}
                    placeholder="Kể lại kỷ niệm của bạn..."
                    rows={4}
                    className="w-full px-3 py-2 border border-line rounded-lg bg-porcelain outline-none focus:border-lacquer focus:ring-1 focus:ring-lacquer text-sm resize-none"
                />
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-sm font-medium text-ink">Ảnh minh họa (Tùy chọn)</label>
                <ImageUploadField
                    value={itemData.imageUrl}
                    onFileSelect={(file) => setItemData((prev: any) => ({ ...prev, imageUrl: file }))}
                    onFileClear={() => setItemData((prev: any) => ({ ...prev, imageUrl: null }))}
                />
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-line">
                {onRemove && (
                    <button 
                        onClick={onRemove}
                        className="mr-auto px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Xóa
                    </button>
                )}
                <button 
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-muted hover:text-ink hover:bg-porcelain rounded-lg transition-colors"
                >
                    Hủy
                </button>
                <button 
                    onClick={onSave}
                    className="px-6 py-2 text-sm font-medium text-white bg-lacquer hover:bg-lacquer-dark rounded-lg transition-colors shadow-sm"
                >
                    Lưu
                </button>
            </div>
        </div>
    );
}