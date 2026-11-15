"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!loading && !user) router.replace("/sign-in?redirect=" + encodeURIComponent(pathname));
  }, [loading, user, router, pathname]);
  if (loading || !user) return null;
  return <>{children}</>;
}
