import Link from "next/link";
import { formatPrice, type InvitationTemplate } from "@/lib/templates";
import { TemplateShowcase } from "./TemplateShowcase";

export function TemplateCard({ template, categoryName }: { template: InvitationTemplate; categoryName?: string }) {
  const free = template.price === 0;
  return (
    <Link
      href={`/templates/${template.slug}`}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#27548A]"
    >
      <TemplateShowcase template={template} />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-[#0E1B2C] group-hover:underline group-hover:underline-offset-4">
            {template.name}
          </h3>
          <p className="mt-0.5 text-sm text-[#5B6B7F]">{categoryName}</p>
        </div>
        <span
          className={
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium " +
            (free ? "bg-[#E3F1E8] text-[#1D5B35]" : "bg-[#E8EEF6] text-[#27548A]")
          }
        >
          {formatPrice(template.price)}
        </span>
      </div>
    </Link>
  );
}