import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Service } from "@/lib/services";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex h-full flex-col rounded-xl border border-[#DDE4EE] bg-white p-5 transition-colors hover:border-[#27548A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27548A]"
    >
      <h3 className="text-base font-semibold group-hover:underline group-hover:underline-offset-4">{service.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5B6B7F]">{service.summary}</p>
      <div className="mt-4 flex items-center justify-between border-t border-[#EEF2F7] pt-3 text-sm">
        <span className="font-semibold text-[#27548A]">Từ {formatPrice(service.priceFrom)}</span>
        <span className="text-[#5B6B7F]">{service.duration}</span>
      </div>
    </Link>
  );
}
