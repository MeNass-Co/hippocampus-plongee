"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionTitle from "@/components/ui/SectionTitle";

export function Agenda() {
  return (
    <section id="agenda" className="py-16 md:py-32 border-t border-on-surface/[0.06]" style={{ backgroundColor: 'rgba(4, 14, 26, 0.92)' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <ScrollReveal animation="fade-up">
          <SectionTitle overline="Prochainement" title="Agenda" />
        </ScrollReveal>

        <div className="mt-10 md:mt-16">
          {/* Empty state — elegant placeholder */}
          <ScrollReveal animation="fade-up" delay={200}>
            <div className="card-frame" style={{ borderRadius: '2rem' }}>
              <div className="card-frame-inner flex flex-col items-center justify-center py-20 md:py-28 text-center" style={{ borderRadius: 'calc(2rem - 0.375rem)', backgroundColor: 'rgba(4, 14, 26, 0.95)' }}>
                <p className="font-headline text-2xl md:text-3xl font-light tracking-tight text-on-surface/70">
                  Saison 2026 — 2027
                </p>
                <p className="mt-4 text-on-surface-variant/70 font-light max-w-md">
                  Le calendrier des sorties et formations sera bientôt disponible. Contactez-nous pour plus d&apos;informations.
                </p>
                <a
                  href="/le-club#contact"
                  className="mt-8 inline-block rounded-full bg-primary/10 px-6 py-2.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-primary hover:bg-primary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors duration-500 ease-expo"
                >
                  Nous contacter
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Small preview of what's to come */}
          <ScrollReveal animation="fade-up" delay={400}>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 py-4 border-b border-on-surface/[0.06]">
                <span className="font-headline text-xl font-light text-primary/70">Sept.</span>
                <span className="text-on-surface/70 font-light">Reprise des entraînements</span>
              </div>
              <div className="flex items-center gap-4 py-4 border-b border-on-surface/[0.06]">
                <span className="font-headline text-xl font-light text-primary/70">Oct.</span>
                <span className="text-on-surface/70 font-light">Sortie fosse Nemo 33</span>
              </div>
              <div className="flex items-center gap-4 py-4 border-b border-on-surface/[0.06]">
                <span className="font-headline text-xl font-light text-primary/70">Nov.</span>
                <span className="text-on-surface/70 font-light">Week-end plongée</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export default Agenda;
