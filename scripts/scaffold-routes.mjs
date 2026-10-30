import fs from "node:fs";
import path from "node:path";

const root = "src/app";
const groups = {
  "(main)": ["", "shop", "collection/[slug]", "product/[productId]",
    "invitations/[[...filters]]", "invitation/[invitationId]", "professional",
    "search/[query]", "faq", "page", "page/[slug]", "ai-face-gen"],
  "(main)/(protected)": ["account-settings", "invitation-management/[[...invitationId]]"],
  "(canvas)": ["canvas", "canvas/template/[templateId]", "canvas/edit/[invitationId]"],
  "(public)": ["events/[id]", "events/[id]/wishes", "sign-in", "sign-up",
    "forgot-password", "reset-password/[token]"],
};

const write = (p, c) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  if (!fs.existsSync(p)) fs.writeFileSync(p, c);
};
const name = (r) => "Page_" + (r || "home").replace(/[^a-zA-Z0-9]+/g, "_");

fs.rmSync(`${root}/page.tsx`, { force: true }); // tránh trùng route "/"

for (const [g, routes] of Object.entries(groups))
  for (const r of routes)
    write(`${root}/${g}/${r}/page.tsx`,
`export default function ${name(r)}() {
  return <div>TODO: /${r}</div>;
}
`);

const guard = (inner) => `import RequireAuth from "@/components/RequireAuth";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>${inner}</RequireAuth>;
}
`;
write(`${root}/(main)/layout.tsx`,
`export default function MainLayout({ children }: { children: React.ReactNode }) {
  // TODO: Header + Footer
  return <>{children}</>;
}
`);
write(`${root}/(main)/(protected)/layout.tsx`, guard("{children}"));
write(`${root}/(canvas)/layout.tsx`, guard("{children}"));

write(`${root}/not-found.tsx`,
`import { redirect } from "next/navigation";
export default function NotFound() { redirect("/"); }
`);

write("src/components/RequireAuth.tsx",
`"use client";
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
`);
console.log("Done");