"use client";

import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Text, Rect, Transformer } from 'react-konva';
import URLImage from './elements/URLImage';
import { useEditorStore } from '@/lib/store/useEditorStore';

// Kích thước chuẩn của một trang thiệp iCards (Ví dụ: tỷ lệ 9:16)
const CANVAS_WIDTH = 450;
const CANVAS_HEIGHT = 800;

export default function CanvasWorkspace() {
    const { elements, selectedId, selectElement, updateElement, zoom } = useEditorStore();
    const stageRef = useRef<any>(null);
    const trRef = useRef<any>(null);
    const layerRef = useRef<any>(null);

    // State cho Inline Text Editor
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0, width: 0, height: 0, rotation: 0 });

    // Cập nhật khung Transformer khi chọn element
    useEffect(() => {
        if (selectedId && trRef.current && layerRef.current) {
            const node = layerRef.current.findOne(`#${selectedId}`);
            if (node) {
                trRef.current.nodes([node]);
                trRef.current.getLayer().batchDraw();
            }
        }
    }, [selectedId, elements]);

    // Bỏ chọn khi click ra ngoài vùng trống
    const checkDeselect = (e: any) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectElement(null);
            setEditingTextId(null); // Đóng input nếu đang gõ
        }
    };

    // Kích hoạt Text Input khi double click vào chữ
    const handleTextDblClick = (e: any, id: string) => {
        const textNode = e.target;
        const stage = textNode.getStage();
        
        // Tính toán tọa độ tuyệt đối của text trên màn hình (tính cả zoom)
        const textPosition = textNode.absolutePosition();
        const stageBox = stage.container().getBoundingClientRect();
        
        const areaPosition = {
            x: stageBox.left + textPosition.x,
            y: stageBox.top + textPosition.y,
            width: textNode.width() * textNode.scaleX() * zoom,
            height: textNode.height() * textNode.scaleY() * zoom,
            rotation: textNode.rotation(),
        };

        setTextInputPos(areaPosition);
        setEditingTextId(id);
        trRef.current?.nodes([]); // Ẩn transformer khi đang gõ
    };

    // Sắp xếp layer theo Z-Index
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const editingElement = elements.find(el => el.id === editingTextId);

    return (
        <div className="relative flex h-full w-full items-center justify-center overflow-auto bg-[#F7F8FB] p-8">
            {/* Khung viền Canvas (Vùng thiết kế thiệp) */}
            <div 
                className="bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-transform origin-center overflow-hidden" 
                style={{ 
                    transform: `scale(${zoom})`, 
                    width: CANVAS_WIDTH, 
                    height: CANVAS_HEIGHT 
                }}
            >
                <Stage 
                    ref={stageRef}
                    width={CANVAS_WIDTH} 
                    height={CANVAS_HEIGHT} 
                    onMouseDown={checkDeselect} 
                    onTouchStart={checkDeselect}
                >
                    <Layer ref={layerRef}>
                        {sortedElements.map((el) => {
                            // 1. Render Hình Ảnh
                            if (el.type === 'image') {
                                return (
                                    <URLImage 
                                        key={el.id} 
                                        element={el} 
                                        onSelect={() => selectElement(el.id)} 
                                        onChange={(attrs) => updateElement(el.id, attrs)} 
                                    />
                                );
                            }
                            
                            // 2. Render Khối (Rect/Shape)
                            if (el.type === 'rect') {
                                return (
                                    <Rect
                                        key={el.id}
                                        id={el.id}
                                        x={el.x}
                                        y={el.y}
                                        width={el.width || 100}
                                        height={el.height || 100}
                                        fill={el.fill}
                                        draggable
                                        onClick={() => selectElement(el.id)}
                                        onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
                                        onTransformEnd={(e) => {
                                            const node = e.target;
                                            updateElement(el.id, {
                                                x: node.x(),
                                                y: node.y(),
                                                width: Math.max(5, node.width() * node.scaleX()),
                                                height: Math.max(5, node.height() * node.scaleY()),
                                                rotation: node.rotation(),
                                            });
                                            node.scaleX(1);
                                            node.scaleY(1);
                                        }}
                                    />
                                );
                            }

                            // 3. Render Văn Bản
                            if (el.type === 'text') {
                                const isEditing = editingTextId === el.id;
                                return (
                                    <Text
                                        key={el.id}
                                        id={el.id}
                                        x={el.x}
                                        y={el.y}
                                        text={el.text}
                                        fontSize={el.fontSize || 32}
                                        fill={el.fill}
                                        rotation={el.rotation || 0}
                                        fontFamily="Be Vietnam Pro"
                                        draggable={!isEditing}
                                        opacity={isEditing ? 0 : 1} // Ẩn text đi khi đang bật thẻ input đè lên
                                        onClick={() => selectElement(el.id)}
                                        onDblClick={(e) => handleTextDblClick(e, el.id)}
                                        onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
                                        onTransformEnd={(e) => {
                                            const node = e.target;
                                            updateElement(el.id, {
                                                x: node.x(),
                                                y: node.y(),
                                                fontSize: Math.max(12, (el.fontSize || 32) * node.scaleY()), // Transform làm đổi font size
                                                rotation: node.rotation(),
                                            });
                                            node.scaleX(1);
                                            node.scaleY(1);
                                        }}
                                    />
                                );
                            }
                            return null;
                        })}
                        
                        {/* Khung Resize (Transformer) */}
                        {selectedId && !editingTextId && (
                            <Transformer 
                                ref={trRef} 
                                borderStroke="#a3152f"
                                anchorStroke="#a3152f"
                                anchorFill="#ffffff"
                                anchorSize={10}
                                boundBoxFunc={(oldBox, newBox) => {
                                    if (newBox.width < 10 || newBox.height < 10) return oldBox;
                                    return newBox;
                                }}
                            />
                        )}
                    </Layer>
                </Stage>
            </div>

            {/* Thẻ HTML TextArea đè lên Canvas khi Double Click vào Text */}
            {editingTextId && editingElement && (
                <textarea
                    autoFocus
                    value={editingElement.text}
                    onChange={(e) => updateElement(editingTextId, { text: e.target.value })}
                    onBlur={() => setEditingTextId(null)}
                    style={{
                        position: 'absolute',
                        top: textInputPos.y,
                        left: textInputPos.x,
                        width: textInputPos.width + 20, // Bù trừ padding
                        height: textInputPos.height + 20,
                        fontSize: `${(editingElement.fontSize || 32) * zoom}px`,
                        fontFamily: 'Be Vietnam Pro',
                        color: editingElement.fill,
                        transform: `rotate(${textInputPos.rotation}deg)`,
                        transformOrigin: 'left top',
                        background: 'transparent',
                        border: '1px dashed #a3152f',
                        outline: 'none',
                        resize: 'none',
                        padding: '0',
                        margin: '0',
                        lineHeight: 1,
                        zIndex: 9999,
                    }}
                />
            )}
        </div>
    );
}