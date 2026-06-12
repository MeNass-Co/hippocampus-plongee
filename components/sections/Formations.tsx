"use client";

import Image from "next/image";
import ScrollReveal from "@/components/ui/ScrollReveal";
import GlassCard from "@/components/ui/GlassCard";

const TRAINING_LEVELS = [
  {
    icon: "\u{1F30A}",
    title: "Baptêmes de Plongée",
    description:
      "Votre première immersion en milieu naturel, encadrée en binôme par un moniteur breveté d\u2019État. Accessible dès 8 ans, sans expérience requise.",
  },
  {
    icon: "\u{1F4D8}",
    title: "Niveau 1 & 2",
    description:
      "Formations FFESSM complètes : théorie en salle, pratique en fosse puis en mer. Autonomie progressive jusqu\u2019à 20 mètres.",
  },
  {
    icon: "\u2713",
    title: "Niveau 3 & Technique",
    description:
      "Plongée profonde, Nitrox, orientation sous-marine. Pour les plongeurs confirmés qui veulent repousser leurs limites.",
  },
] as const;

export function Formations() {
  return (
    <section id="formations" className="py-16 md:py-32 px-6 md:px-12 lg:px-24 border-t border-on-surface/[0.06]" style={{ backgroundColor: 'rgba(2, 10, 20, 0.85)' }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left — Image placeholder */}
        <ScrollReveal animation="fade-right">
          <div className="relative">
            <div className="card-frame">
              <div className="card-frame-inner">
                <div className="aspect-[4/5] relative">
                  <Image
                    src="/assets/photos/formations.webp"
                    alt="Formation de plongée sous-marine"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
            {/* Floating certification card */}
            <GlassCard
              hover={false}
              className="absolute -bottom-6 -right-4 md:right-4 px-6 py-4 max-w-[280px]"
            >
              <p className="text-xs font-label uppercase tracking-[0.2em] text-primary mb-1">
                Certifications
              </p>
              <p className="text-sm text-on-surface font-medium">
                FFESSM / Normes Internationales
              </p>
            </GlassCard>
          </div>
        </ScrollReveal>

        {/* Right — Text + training levels */}
        <div>
          <ScrollReveal animation="fade-up">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-6 tracking-[-0.02em] leading-tight">
              Formations Certifiées FFESSM
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={100}>
            <p className="text-on-surface-variant font-light leading-relaxed mb-10 max-w-xl">
              Du premier souffle sous l&apos;eau aux exp&eacute;ditions techniques les
              plus exigeantes, nos encadrants diplômés vous
              accompagnent à chaque étape de votre progression.
            </p>
          </ScrollReveal>

          <div className="flex flex-col gap-4">
            {TRAINING_LEVELS.map((level, i) => (
              <ScrollReveal key={level.title} animation="fade-up" delay={200 + i * 120}>
                <div className="group cursor-default card-frame transition-all duration-500 ease-expo hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(56,217,220,0.08)]">
                  <div className="card-frame-inner p-6 transition-all duration-500 ease-expo group-hover:bg-on-surface/[0.03]">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl shrink-0 mt-0.5">{level.icon}</span>
                      <div>
                        <h3 className="font-headline text-lg font-semibold text-on-surface mb-1 leading-tight">
                          {level.title}
                        </h3>
                        <p className="text-sm text-on-surface-variant font-light leading-relaxed">
                          {level.description}
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

export default Formations;
