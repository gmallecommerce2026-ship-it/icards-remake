"use client";

import { Text } from 'react-konva';
import { CanvasItem } from '@/lib/store/useEditorStore';

interface EditableTextProps {
    item: CanvasItem;
    isSelected: boolean;
    isEditing: boolean;
    onSelect: () => void;
    onDoubleClick: (e: any, id: string) => void;
    onChange: (updates: Partial<CanvasItem>) => void;
}

export default function EditableText({ item, isSelected, isEditing, onSelect, onDoubleClick, onChange }: EditableTextProps) {
    const fontStyleString = `${item.fontStyle === 'italic' ? 'italic' : 'normal'} ${item.fontWeight === 'bold' ? 'bold' : 'normal'}`;

    return (
        <Text
            id={item.id}
            x={item.x}
            y={item.y}
            text={item.isGuestName ? '[Tên Khách Mời]' : (item.text || 'Văn bản')}
            fontSize={item.fontSize || 32}
            fontFamily={item.fontFamily || 'Be Vietnam Pro'}
            fill={item.fill || '#1c1a24'}
            rotation={item.rotation || 0}
            fontStyle={fontStyleString}
            textDecoration={item.textDecoration || 'none'}
            align={item.textAlign || 'center'}
            width={item.width} // Kích hoạt cơ chế tự động rớt dòng của Konva
            draggable={!item.locked && !isEditing}
            // Tàng hình khi đang bật thẻ input đè lên
            opacity={isEditing ? 0 : (item.visible === false ? 0 : 1)}
            onClick={onSelect}
            onTap={onSelect}
            onDblClick={(e) => {
                if (!item.locked) onDoubleClick(e, item.id);
            }}
            onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
            onTransformEnd={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                
                node.scaleX(1);
                node.scaleY(1);
                
                onChange({
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(20, node.width() * scaleX),
                    // Tăng giảm size chữ khi kéo góc
                    fontSize: Math.max(8, (item.fontSize || 32) * scaleY),
                    rotation: node.rotation(),
                });
            }}
        />
    );
}