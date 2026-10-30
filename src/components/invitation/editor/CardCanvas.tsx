// src/components/invitation/editor/CardCanvas.tsx
'use client';

import { forwardRef, useEffect, useRef } from 'react';
import { Image as KImage, Layer, Rect, Stage, Text as KText, Transformer } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';
import { useEditorStore, type CardElement } from './useEditorStore';

export const CARD_W = 600;
export const CARD_H = 420; // tỉ lệ 1 : 0.7, khớp với EnvelopeScene

function Node({ el }: { el: CardElement }) {
  const { selectedId, select, update } = useEditorStore();
  const ref = useRef<any>(null);
  const tr = useRef<Konva.Transformer>(null);
  const [img] = useImage(el.src ?? '', 'anonymous');
  const selected = selectedId === el.id;

  useEffect(() => {
    if (selected && tr.current && ref.current) {
      tr.current.nodes([ref.current]);
      tr.current.getLayer()?.batchDraw();
    }
  }, [selected]);

  const common = {
    ref, x: el.x, y: el.y, rotation: el.rotation, draggable: true,
    onClick: () => select(el.id), onTap: () => select(el.id),
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => update(el.id, { x: e.target.x(), y: e.target.y() }),
    onTransformEnd: () => {
      const n = ref.current;
      update(el.id, { x: n.x(), y: n.y(), rotation: n.rotation(), width: n.width() * n.scaleX(), height: n.height() * n.scaleY() });
      n.scaleX(1); n.scaleY(1);
    },
  };

  return (
    <>
      {el.type === 'text' ? (
        <KText {...common} text={el.text} fontSize={el.fontSize} fill={el.fill} fontFamily={el.fontFamily} width={el.width}
          onDblClick={() => { const t = window.prompt('Nội dung', el.text); if (t !== null) update(el.id, { text: t }); }} />
      ) : (
        <KImage {...common} image={img} width={el.width} height={el.height} />
      )}
      {selected && <Transformer ref={tr} rotateEnabled keepRatio={el.type === 'image'} />}
    </>
  );
}

export const CardCanvas = forwardRef<Konva.Stage>(function CardCanvas(_, stageRef) {
  const { elements, select } = useEditorStore();
  return (
    <Stage ref={stageRef} width={CARD_W} height={CARD_H} style={{ boxShadow: '0 8px 30px rgb(0 0 0 / .15)', background: '#fff' }}
      onMouseDown={(e) => { if (e.target === e.target.getStage() || e.target.name() === 'bg') select(null); }}>
      <Layer>
        <Rect name="bg" width={CARD_W} height={CARD_H} fill="#fffaf0" />
        {elements.map((el) => <Node key={el.id} el={el} />)}
      </Layer>
    </Stage>
  );
});