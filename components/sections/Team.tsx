import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionTitle from "@/components/ui/SectionTitle";

interface TeamMember {
  name: string;
  role: string;
  quote: string;
  gradient: string;
}

const INSTRUCTORS: TeamMember[] = [
  {
    name: "Vivien Dambreville",
    role: "Pr\u00e9sident & Moniteur",
    quote:
      "La patience et la technique sont les deux piliers d\u2019une plong\u00e9e r\u00e9ussie. On ne force jamais la mer.",
    gradient: "linear-gradient(160deg, #0a2540 0%, #003738 60%, #00ced1 140%)",
  },
  {
    name: "Céline Dambreville",
    role: "Monitrice",
    quote:
      "Chaque plong\u00e9e est une occasion d\u2019observer un \u00e9cosyst\u00e8me vivant. La biologie marine commence d\u00e8s le masque pos\u00e9.",
    gradient: "linear-gradient(160deg, #061422 0%, #0a2540 50%, #005354 140%)",
  },
  {
    name: "José",
    role: "Membre",
    quote:
      "Sous l’eau, on apprend à faire confiance à son binôme autant qu’à soi-même.",
    gradient: "linear-gradient(160deg, #0a2540 0%, #0d2f4f 50%, #006b6e 140%)",
  },
  {
    name: "Cédric",
    role: "Membre",
    quote:
      "La mer nous rappelle chaque jour que l’humilité est la première qualité d’un plongeur.",
    gradient: "linear-gradient(160deg, #061422 0%, #0a2540 50%, #004d4f 140%)",
  },
];

export function Team() {
  return (
    <section className="py-16 md:py-32" style={{ backgroundColor: 'rgba(4, 14, 26, 0.85)' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Title */}
        <ScrollReveal animation="fade-up">
          <SectionTitle
            overline="L'&Eacute;quipe"
            title="Notre &Eacute;quipage"
            className="mb-10 md:mb-16"
          />
        </ScrollReveal>

        {/* Team member rows — service-row layout */}
        <div>
          {INSTRUCTORS.map((member, i) => (
            <ScrollReveal key={member.name} animation="fade-up" delay={i * 100}>
              <div
                className="border-t border-on-surface/[0.06] py-8 md:py-14 transition-colors duration-500 ease-expo hover:bg-on-surface/[0.02]"
              >
                <div className="grid gap-6 md:grid-cols-12 md:items-center md:gap-10">
                  {/* Avatar — initials monogram */}
                  <div className="md:col-span-1">
                    <div
                      className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center ring-1 ring-on-surface/[0.08]"
                      style={{ background: member.gradient }}
                      aria-hidden="true"
                    >
                      <span className="font-headline text-lg font-light tracking-[0.08em] text-on-surface/80">
                        {member.name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                    </div>
                  </div>

                  {/* Name + Role */}
                  <div className="md:col-span-3">
                    <h3 className="font-headline text-2xl font-light text-on-surface leading-tight">
                      {member.name}
                    </h3>
                    <p className="text-on-surface-variant text-sm mt-1">
                      {member.role}
                    </p>
                  </div>

                  {/* Quote */}
                  <div className="md:col-span-8">
                    <p className="italic text-on-surface-variant font-light leading-relaxed max-w-[55ch]">
                      &laquo;&nbsp;{member.quote}&nbsp;&raquo;
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
          {/* Bottom border on last row */}
          <div className="border-t border-on-surface/[0.06]" />
        </div>
      </div>
    </section>
  );
}

export default Team;
