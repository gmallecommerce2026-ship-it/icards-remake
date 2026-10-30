import type { Metadata } from "next";
import { Suspense } from "react";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog | iCards",
  description:
    "Hướng dẫn tạo thiệp mời online, cách viết lời mời, kinh nghiệm tổ chức đám cưới và sự kiện.",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BlogClient />
    </Suspense>
  );
}