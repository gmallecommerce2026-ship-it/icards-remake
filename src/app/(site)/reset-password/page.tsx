import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = { title: "Đặt lại mật khẩu | iCards" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordClient />
    </Suspense>
  );
}
