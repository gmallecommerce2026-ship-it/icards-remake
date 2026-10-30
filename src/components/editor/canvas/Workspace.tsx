"use client";

import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { useEditorStore } from '@/lib/store/useEditorStore';
import URLImage from '../elements/URLImage';
import EditableText from '../elements/EditableText';

export default function Workspace() {
    const { present, currentPageId, selectedIds, setSelection, updateItem, zoom } = useEditorStore();
    
    // Tìm trang hiện tại dựa vào currentPageId
    const currentPage = present.find(p => p.id === currentPageId) || present[0];
    const currentItems = currentPage?.items || [];

    const stageRef = useRef<any>(null);
    const layerRef = useRef<any>(null);
    const trRef = useRef<any>(null);

    // Trạng thái cho Editable HTML Overlay
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    const [inputPos, setInputPos] = useState({ x: 0, y: 0, width: 0, height: 0, rotation: 0 });

    // Áp dụng Transformer khi chọn vật thể
    useEffect(() => {
        if (selectedIds.length > 0 && trRef.current && layerRef.current) {
            const nodes = selectedIds.map(id => layerRef.current.findOne(`#${id}`)).filter(Boolean);
            if (nodes.length > 0) {
                trRef.current.nodes(nodes);
                trRef.current.getLayer().batchDraw();
            } else {
                trRef.current.nodes([]);
            }
        } else if (trRef.current) {
            trRef.current.nodes([]);
        }
    }, [selectedIds, currentItems]);

    // Xử lý Click ra ngoài Canvas
    const checkDeselect = (e: any) => {
        const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'background';
        if (clickedOnEmpty) {
            setSelection([]);
            setEditingTextId(null);
        }
    };

    // Tính toán tọa độ HTML cho thẻ Textarea
    const handleTextDblClick = (e: any, id: string) => {
        const textNode = e.target;
        const stage = textNode.getStage();
        const textPosition = textNode.absolutePosition();
        const stageBox = stage.container().getBoundingClientRect();
        
        setInputPos({
            x: stageBox.left + textPosition.x,
            y: stageBox.top + textPosition.y,
            width: textNode.width() * textNode.scaleX() * zoom,
            height: textNode.height() * textNode.scaleY() * zoom,
            rotation: textNode.rotation(),
        });
        setEditingTextId(id);
        trRef.current?.nodes([]); // Tạm ẩn Transformer khi gõ
    };

    if (!currentPage) return <div className="flex h-full items-center justify-center bg-[#F7F8FB]">Đang tải Canvas...</div>;

    const editingItem = currentItems.find(el => el.id === editingTextId);
    // Render Layer sắp xếp theo zIndex
    const sortedItems = [...currentItems].sort((a, b) => a.zIndex - b.zIndex);

    return (
        <div className="relative flex h-full w-full items-center justify-center overflow-auto bg-[#F7F8FB] p-8">
            <div 
                className="bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-transform origin-center overflow-hidden" 
                style={{ 
                    transform: `scale(${zoom})`, 
                    width: currentPage.canvasWidth, 
                    height: currentPage.canvasHeight 
                }}
            >
                <Stage 
                    ref={stageRef}
                    width={currentPage.canvasWidth} 
                    height={currentPage.canvasHeight} 
                    onMouseDown={checkDeselect} 
                    onTouchStart={checkDeselect}
                >
                    <Layer ref={layerRef}>
                        {/* Rect làm nền trang (bắt sự kiện click ra ngoài) */}
                        <Rect
                            name="background"
                            x={0} y={0}
                            width={currentPage.canvasWidth}
                            height={currentPage.canvasHeight}
                            fill={currentPage.backgroundColor}
                        />

                        {sortedItems.map((item) => {
                            if (item.type === 'image') {
                                return (
                                    <URLImage 
                                        key={item.id} 
                                        item={item} 
                                        isSelected={selectedIds.includes(item.id)}
                                        onSelect={() => {
                                            setSelection([item.id]);
                                            setEditingTextId(null);
                                        }} 
                                        onChange={(updates) => updateItem(item.id, updates)} 
                                    />
                                );
                            }
                            if (item.type === 'text') {
                                return (
                                    <EditableText
                                        key={item.id}
                                        item={item}
                                        isSelected={selectedIds.includes(item.id)}
                                        isEditing={editingTextId === item.id}
                                        onSelect={() => {
                                            setSelection([item.id]);
                                            setEditingTextId(null);
                                        }}
                                        onDoubleClick={handleTextDblClick}
                                        onChange={(updates) => updateItem(item.id, updates)}
                                    />
                                );
                            }
                            return null;
                        })}
                        
                        {/* Công cụ Resize/Rotate */}
                        <Transformer 
                            ref={trRef} 
                            borderStroke="#a3152f" // Màu lacquer của bạn
                            anchorStroke="#a3152f"
                            anchorFill="#ffffff"
                            anchorSize={10}
                            boundBoxFunc={(oldBox, newBox) => {
                                if (newBox.width < 10 || newBox.height < 10) return oldBox;
                                return newBox;
                            }}
                        />
                    </Layer>
                </Stage>
            </div>

            {/* OVERLAY NHẬP LIỆU BẰNG HTML (CHỐNG LỖI HIỂN THỊ DẤU TIẾNG VIỆT) */}
            {editingTextId && editingItem && (
                <textarea
                    autoFocus
                    value={editingItem.text || ''}
                    onChange={(e) => updateItem(editingTextId, { text: e.target.value }, false)}
                    onBlur={() => {
                        setEditingTextId(null);
                        updateItem(editingTextId, {}, true); // Lưu vào History khi gõ xong
                    }}
                    style={{
                        position: 'absolute',
                        top: inputPos.y,
                        left: inputPos.x,
                        width: inputPos.width + 20,
                        height: inputPos.height + 20,
                        fontSize: `${(editingItem.fontSize || 32) * zoom}px`,
                        fontFamily: editingItem.fontFamily || 'Be Vietnam Pro',
                        fontWeight: editingItem.fontWeight || 'normal',
                        fontStyle: editingItem.fontStyle || 'normal',
                        textAlign: editingItem.textAlign || 'center',
                        color: editingItem.fill || '#1c1a24',
                        transform: `rotate(${inputPos.rotation}deg)`,
                        transformOrigin: 'left top',
                        background: 'transparent',
                        border: '1px dashed #a3152f',
                        outline: 'none',
                        resize: 'none',
                        padding: '0',
                        margin: '0',
                        lineHeight: 1.2,
                        zIndex: 9999,
                    }}
                />
            )}
        </div>
    );
}