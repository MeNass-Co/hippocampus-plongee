"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionTitle from "@/components/ui/SectionTitle";
import Badge from "@/components/ui/Badge";

const VOYAGES = {
  main: {
    title: "Caraïbes & Eaux Turquoise",
    subtitle: "Guadeloupe",
    badge: "Prochaine Expédition",
    gradient: "linear-gradient(135deg, #0a2540 0%, #003738 50%, #13212e 100%)",
    image: "/assets/photos/voyage-med.webp",
  },
  cards: [
    {
      title: "Égypte & Mer Rouge",
      description:
        "Récifs coralliens, tombants vertigineux et eaux cristallines. L\u2019expérience ultime de la plongée tropicale.",
      gradient: "linear-gradient(135deg, #1d2b39 0%, #0a2540 50%, #005354 100%)",
      image: "/assets/photos/voyage-egypt.webp",
    },
    {
      title: "Seychelles & Maldives",
      description:
        "Lagons paradisiaques, raies manta et requins-baleines. Des séjours d\u2019exception au cœur de l\u2019océan Indien.",
      gradient: "linear-gradient(135deg, #13212e 0%, #283644 50%, #0a2540 100%)",
      image: "/assets/photos/voyage-tech.webp",
    },
  ],
} as const;

export function Voyages() {
  return (
    <section className="py-16 md:py-32 px-6 md:px-12 lg:px-24 relative overflow-hidden border-t border-on-surface/[0.06]" style={{ backgroundColor: 'rgba(2, 10, 20, 0.85)' }}>
      {/* Decorative blur */}
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto">
        <ScrollReveal animation="fade-up">
          <SectionTitle
            overline="Ailleurs"
            title="Voyages & Explorations"
            description="De la Guadeloupe aux Maldives en passant par la Mer Rouge, nos voyages sont pensés pour les plongeurs avides de découverte."
            align="center"
            className="mb-10 md:mb-16"
          />
        </ScrollReveal>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-auto md:h-[600px]">
          {/* Large card — col-span-7, full height */}
          <ScrollReveal
            animation="fade-up"
            delay={100}
            className="md:col-span-7 h-[320px] md:h-full"
          >
            <div className="card-frame h-full">
              <div className="card-frame-inner h-full">
                <div
                  className="relative h-full group"
                  style={{ background: VOYAGES.main.gradient }}
                >
                  {/* Background image with hover scale */}
                  <div
                    className="absolute inset-0 transition-transform duration-700 ease-expo group-hover:scale-105"
                  >
                    <img
                      src={VOYAGES.main.image}
                      alt={VOYAGES.main.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {/* Overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(2,15,28,0.9) 0%, rgba(2,15,28,0.3) 40%, transparent 100%)",
                    }}
                  />

                  {/* Content overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <Badge variant="tertiary" className="mb-4 w-fit">
                      {VOYAGES.main.badge}
                    </Badge>
                    <h3 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-2 tracking-[-0.02em] leading-tight">
                      {VOYAGES.main.title}
                    </h3>
                    <p className="text-on-surface-variant font-light text-lg leading-relaxed">
                      {VOYAGES.main.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Two stacked cards — col-span-5 */}
          <div className="md:col-span-5 flex flex-col gap-4">
            {VOYAGES.cards.map((card, i) => (
              <ScrollReveal
                key={card.title}
                animation="fade-up"
                delay={200 + i * 120}
                className="flex-1 min-h-[200px]"
              >
                <div className="card-frame h-full">
                  <div className="card-frame-inner h-full">
                    <div
                      className="relative h-full group"
                      style={{ background: card.gradient }}
                    >
                      {/* Background image with hover scale */}
                      <div
                        className="absolute inset-0 transition-transform duration-700 ease-expo group-hover:scale-105"
                      >
                        <img
                          src={card.image}
                          alt={card.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                      decoding="async"
                        />
                      </div>

                      {/* Overlay */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(2,15,28,0.85) 0%, rgba(2,15,28,0.2) 60%, transparent 100%)",
                        }}
                      />

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <h3 className="font-headline text-xl md:text-2xl font-bold text-on-surface mb-2">
                          {card.title}
                        </h3>
                        <p className="text-sm text-on-surface-variant font-light leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Voyages;
