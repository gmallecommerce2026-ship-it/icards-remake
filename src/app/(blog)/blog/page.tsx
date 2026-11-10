import type { Metadata } from "next";
import { Suspense } from "react";
import BlogClient from "./BlogClient";
import { getBlogCategories, getPageCopy, getPosts } from "@/lib/catalog";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPageCopy();
  return { title: `${copy.blog.title} | iCards`, description: copy.blog.description };
}

export default async function Page() {
  const [posts, categories, copy] = await Promise.all([getPosts(), getBlogCategories(), getPageCopy()]);
  return (
    <Suspense fallback={null}>
      <BlogClient posts={posts} categories={categories} copy={copy.blog} />
    </Suspense>
  );
}
