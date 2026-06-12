import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reglement Interieur",
  description: "Reglement interieur du club de plongee Hippocampus a Sissonne.",
};

export default function ReglementInterieur() {
  return (
    <section
      className="py-24 md:py-32 px-6 md:px-12 lg:px-24 relative"
      style={{ backgroundColor: "rgba(2, 10, 20, 0.85)" }}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-10 tracking-[-0.02em] leading-tight">
          R&egrave;glement Int&eacute;rieur
        </h1>

        <div className="prose prose-invert prose-sm max-w-none text-on-surface-variant font-light leading-relaxed space-y-8">
          <div>
            <h2 className="font-headline text-xl text-on-surface font-semibold mb-3">Article 1 &mdash; Objet</h2>
            <p>
              Le pr&eacute;sent r&egrave;glement int&eacute;rieur d&eacute;finit les r&egrave;gles de fonctionnement
              du club HIPPOCAMPUS, association loi 1901 affili&eacute;e &agrave; la FFESSM.
            </p>
          </div>

          <div>
            <h2 className="font-headline text-xl text-on-surface font-semibold mb-3">Article 2 &mdash; Adh&eacute;sion</h2>
            <p>
              Tout membre doit &ecirc;tre &agrave; jour de sa cotisation annuelle et de sa licence FFESSM.
              Un certificat m&eacute;dical de non-contre-indication &agrave; la plong&eacute;e sous-marine est
              obligatoire.
            </p>
          </div>

          <div>
            <h2 className="font-headline text-xl text-on-surface font-semibold mb-3">Article 3 &mdash; S&eacute;curit&eacute;</h2>
            <p>
              Chaque plongeur doit respecter les consignes de s&eacute;curit&eacute; donn&eacute;es par le
              directeur de plong&eacute;e. Le briefing pr&eacute;-plong&eacute;e est obligatoire. Aucune plong&eacute;e
              ne peut &ecirc;tre effectu&eacute;e sans encadrement conforme aux r&egrave;gles FFESSM.
            </p>
          </div>

          <div>
            <h2 className="font-headline text-xl text-on-surface font-semibold mb-3">Article 4 &mdash; Mat&eacute;riel</h2>
            <p>
              Le mat&eacute;riel du club est mis &agrave; disposition des membres. Chaque utilisateur
              est responsable du mat&eacute;riel emprunt&eacute; et doit le rin&ccedil;er apr&egrave;s usage.
              Tout dysfonctionnement doit &ecirc;tre signal&eacute; imm&eacute;diatement.
            </p>
          </div>

          <div>
            <h2 className="font-headline text-xl text-on-surface font-semibold mb-3">Article 5 &mdash; Respect</h2>
            <p>
              Les membres s&apos;engagent &agrave; respecter l&apos;environnement marin, les autres
              plongeurs et les r&egrave;gles de convivialit&eacute; du club. Tout comportement
              contraire &agrave; ces principes pourra entra&icirc;ner des sanctions.
            </p>
          </div>

          <p className="text-on-surface-variant/60 text-xs italic mt-8">
            Ce r&egrave;glement sera compl&eacute;t&eacute; prochainement. Pour toute question, contactez-nous
            &agrave;{" "}
            <a href="mailto:contact@hippocampus-plongee.fr" className="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm">
              contact@hippocampus-plongee.fr
            </a>.
          </p>
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
