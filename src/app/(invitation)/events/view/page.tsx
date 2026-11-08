import { Suspense } from "react";
import { PublicInvitation } from "@/components/invitation/public/PublicInvitation";

export const metadata = { title: "Thiệp mời | iCards", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PublicInvitation />
    </Suspense>
  );
}
