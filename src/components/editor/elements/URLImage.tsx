"use client";

import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { CanvasItem } from '@/lib/store/useEditorStore';

interface URLImageProps {
    item: CanvasItem;
    isSelected: boolean;
    onSelect: () => void;
    onChange: (updates: Partial<CanvasItem>) => void;
}

export default function URLImage({ item, isSelected, onSelect, onChange }: URLImageProps) {
    // Thuộc tính 'anonymous' cực kỳ quan trọng để xử lý CORS khi xuất file ảnh/PDF
    const [image] = useImage(item.src || '', 'anonymous');

    return (
        <KonvaImage
            id={item.id}
            image={image}
            x={item.x}
            y={item.y}
            width={item.width}
            height={item.height}
            rotation={item.rotation || 0}
            draggable={!item.locked}
            opacity={item.visible === false ? 0 : 1}
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={(e) => {
                onChange({ x: e.target.x(), y: e.target.y() });
            }}
            onTransformEnd={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                
                // Reset scale về 1 để tránh lỗi mờ ảnh và dễ tính toán tọa độ
                node.scaleX(1);
                node.scaleY(1);
                
                onChange({
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(5, node.width() * scaleX),
                    height: Math.max(5, node.height() * scaleY),
                    rotation: node.rotation(),
                });
            }}
            // (Mở rộng sau) Xử lý bộ lọc màu:
            // filters={item.grayscale ? [Konva.Filters.Grayscale] : []}
        />
    );
}