import Link from "next/link";
import { categoryLabel, formatPrice, type InvitationTemplate } from "@/lib/templates";
import { InvitationPreview } from "./InvitationPreview";

export function TemplateCard({ template }: { template: InvitationTemplate }) {
  const free = template.price === 0;
  return (
    <Link
      href={`/templates/${template.slug}`}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#27548A]"
    >
      <div className="overflow-hidden rounded-lg ring-1 ring-[#0E1B2C]/10">
        <InvitationPreview template={template} />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-[#0E1B2C] group-hover:underline group-hover:underline-offset-4">
            {template.name}
          </h3>
          <p className="mt-0.5 text-sm text-[#5B6B7F]">{categoryLabel(template.category)}</p>
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