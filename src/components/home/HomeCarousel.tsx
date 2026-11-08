import { Carousel } from "@/components/ui/Carousel";
import { HOME_BANNERS } from "@/lib/banners";

export function HomeCarousel() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
      <Carousel slides={HOME_BANNERS} />
    </section>
  );
}
