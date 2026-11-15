"use client";

/* VÍ DỤ gắn vào editor: đổi nút "Lưu" thành "Tiếp theo".
   Copy phần logic vào component editor của bạn, đừng import file này. */

import { useState } from "react";
import { InvitationSendFlow } from "./InvitationSendFlow";

// TODO: thay bằng hàm xuất ảnh canvas thiệp sẵn có của bạn (trả về dataURL/URL ảnh).
// Nếu chưa có: npm i html-to-image  →  toPng(canvasElement, { pixelRatio: 2 })
async function exportCanvasToPng(): Promise<string> {
  return "";
}

export function ExampleNextButton({ canvasWidth, canvasHeight }: { canvasWidth: number; canvasHeight: number }) {
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<string>();

  const handleNext = async () => {
    // await handleSave();            // nếu muốn Next vẫn lưu thiết kế như nút Lưu cũ
    setSnapshot(await exportCanvasToPng());
    setOpen(true);
  };

  return (
    <>
      <button type="button" onClick={handleNext} className="rounded-full bg-[#A3152F] px-5 py-2 text-sm font-semibold text-white">
        Tiếp theo
      </button>

      <InvitationSendFlow
        open={open}
        cardImage={snapshot}
        cardAspect={canvasHeight / canvasWidth}
        onClose={() => setOpen(false)}
        onAddGuests={() => {/* điều hướng sang bước thêm khách mời */}}
      />
    </>
  );
}
