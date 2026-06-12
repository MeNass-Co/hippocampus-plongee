import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions Legales",
  description: "Mentions legales du site Hippocampus, club de plongee sous-marine a Sissonne.",
};

export default function MentionsLegales() {
  return (
    <section
      className="py-24 md:py-32 px-6 md:px-12 lg:px-24 relative"
      style={{ backgroundColor: "rgba(2, 10, 20, 0.85)" }}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-10 tracking-[-0.02em] leading-tight">
          Mentions L&eacute;gales
        </h1>

        <div className="prose prose-invert prose-sm max-w-none text-on-surface-variant font-light leading-relaxed space-y-8">
          <div>
            <h2 className="font-headline text-xl text-on-surface font-semibold mb-3">&Eacute;diteur du site</h2>
            <p>
              HIPPOCAMPUS &mdash; Club de Plong&eacute;e Sous-Marine
              <br />
              Base Nautique de Sissonne, 02150 Sissonne, France
              <br />
              E-mail&nbsp;:{" "}
              <a href="mailto:contact@hippocampus-plongee.fr" className="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm">
                contact@hippocampus-plongee.fr
              </a>
            </p>
            <p>Association loi 1901 affili&eacute;e &agrave; la FFESSM.</p>
          </div>

          <div>
            <h2 className="font-headline text-xl text-on-surface font-semibold mb-3">H&eacute;bergement</h2>
            <p>
              Ce site est h&eacute;berg&eacute; par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, &Eacute;tats-Unis.
            </p>
          </div>

          <div>
            <h2 className="font-headline text-xl text-on-surface font-semibold mb-3">Propri&eacute;t&eacute; intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu de ce site (textes, images, logo) est la propri&eacute;t&eacute; exclusive
              d&apos;HIPPOCAMPUS, sauf mention contraire. Toute reproduction est interdite sans
              autorisation pr&eacute;alable.
            </p>
          </div>

          <div>
            <h2 className="font-headline text-xl text-on-surface font-semibold mb-3">Donn&eacute;es personnelles</h2>
            <p>
              Les informations collect&eacute;es via le formulaire de contact sont destin&eacute;es uniquement
              &agrave; l&apos;&eacute;quipe HIPPOCAMPUS et ne sont jamais transmises &agrave; des tiers.
              Conform&eacute;ment au RGPD, vous disposez d&apos;un droit d&apos;acc&egrave;s, de rectification et de
              suppression de vos donn&eacute;es en contactant{" "}
              <a href="mailto:contact@hippocampus-plongee.fr" className="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm">
                contact@hippocampus-plongee.fr
              </a>.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm transition-colors duration-500"
          >
            &larr; Retour &agrave; l&apos;accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
