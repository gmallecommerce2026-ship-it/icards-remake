import type { Metadata } from "next";
import { Suspense } from "react";
import BlogClient from "./BlogClient";
import { getBlogCategories, getPosts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Blog | iCards",
  description:
    "Hướng dẫn tạo thiệp mời online, cách viết lời mời, kinh nghiệm tổ chức đám cưới và sự kiện.",
};

export default async function Page() {
  const [posts, categories] = await Promise.all([getPosts(), getBlogCategories()]);
  return (
    <Suspense fallback={null}>
      <BlogClient posts={posts} categories={categories} />
    </Suspense>
  );
}
