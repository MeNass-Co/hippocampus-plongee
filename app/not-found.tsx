import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative min-h-[70dvh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 80%, rgba(56,217,220,0.06) 0%, transparent 60%), linear-gradient(180deg, #0e1d2a 0%, #040E1A 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-xl mx-auto">
        {/* Seahorse logo */}
        <img
          src="/assets/photos/logo-cyan.webp"
          alt=""
          width={112}
          height={112}
          decoding="async"
          className="mx-auto h-28 w-auto mb-10 opacity-40"
          aria-hidden="true"
        />
        <p className="font-headline text-8xl md:text-9xl font-bold text-primary/20 tracking-[-0.04em] mb-4">
          404
        </p>
        <h1 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-4 tracking-[-0.02em]">
          Perdus dans l&apos;abysse
        </h1>
        <p className="text-on-surface-variant font-light leading-relaxed mb-10">
          Cette page a sombr&eacute; dans les profondeurs. Remontez &agrave; la surface
          et reprenez votre exploration.
        </p>
        <Link
          href="/"
          className="inline-block uppercase tracking-[0.2em] transition-all duration-500 ease-expo rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold px-8 py-3 text-sm hover:shadow-[0_0_20px_rgba(71,234,237,0.4)] hover:-translate-y-px active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Retour &agrave; l&apos;accueil
        </Link>
      </div>
    </section>
  );
}
