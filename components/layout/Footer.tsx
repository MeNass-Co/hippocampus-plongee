import Link from "next/link";

const FOOTER_NAV = [
  { label: "Le Club", href: "/le-club" },
  { label: "Formations", href: "/#formations" },
  { label: "Agenda", href: "/#agenda" },
  { label: "Contact", href: "/le-club#contact" },
] as const;

export default function Footer() {
  return (
    <footer className="relative z-10 py-12 md:py-24 px-6 md:px-12" style={{ backgroundColor: 'rgba(2, 10, 20, 0.92)' }}>
      <div className="max-w-7xl mx-auto">
        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {/* Column 1 — Brand */}
          <div>
            <div className="flex items-center gap-4">
              <img
                src="/assets/photos/logo-cyan.webp"
                alt="Hippocampus — hippocampe"
                width={80}
                height={80}
                className="h-20 w-auto opacity-90"
                loading="lazy"
                decoding="async"
              />
              <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tighter leading-tight">
                HIPPOCAMPUS
              </h2>
            </div>
            <p className="mt-4 text-on-surface/70 max-w-xs font-light leading-relaxed">
              Depuis 2010, nous formons et accompagnons les plongeurs
              de tous niveaux dans la découverte des fonds marins.
            </p>
          </div>

          {/* Column 2 — Navigation */}
          <nav aria-label="Navigation pied de page">
            <h3 className="text-xs font-label font-bold uppercase tracking-[0.4em] text-primary mb-8">
              Navigation
            </h3>
            <ul className="flex flex-col gap-4">
              {FOOTER_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-on-surface/60 hover:text-primary transition-colors text-xs uppercase tracking-widest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm active:scale-[0.98]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3 — Contact */}
          <div>
            <h3 className="text-xs font-label font-bold uppercase tracking-[0.4em] text-primary mb-8">
              Contact
            </h3>
            <address className="not-italic flex flex-col gap-4 text-on-surface/60 text-sm leading-relaxed">
              <p>
                Base Nautique de Sissonne,
                <br />
                02150 Sissonne, France
              </p>
              <a
                href="mailto:contact@hippocampus-plongee.fr"
                className="text-on-surface/70 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
              >
                contact@hippocampus-plongee.fr
              </a>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-on-surface/[0.06] pt-12 mt-16 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-on-surface/40 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} HIPPOCAMPUS — Club de Plong&eacute;e Sous-Marine. Affili&eacute; FFESSM.
          </p>
          <div className="flex gap-6">
            <Link
              href="/mentions-legales"
              className="text-[10px] text-on-surface/40 uppercase tracking-widest hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
            >
              Mentions Légales
            </Link>
            <Link
              href="/reglement-interieur"
              className="text-[10px] text-on-surface/40 uppercase tracking-widest hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
            >
              Règlement Intérieur
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
