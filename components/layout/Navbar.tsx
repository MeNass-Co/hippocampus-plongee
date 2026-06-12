"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  /* ── Scroll detection (rAF-throttled) ── */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Intersection Observer for section anchors ── */
  useEffect(() => {
    if (pathname !== "/") {
      // Use a microtask to avoid synchronous setState in effect body
      queueMicrotask(() => setActiveSection(null));
      return;
    }

    const sectionIds = ["formations", "agenda", "galerie"];
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Find which sections are currently intersecting
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        // Pick the one with highest intersection ratio
        const best = visible.reduce((a, b) =>
          a.intersectionRatio > b.intersectionRatio ? a : b
        );
        setActiveSection(best.target.id);
      } else {
        // Check if we're at the top of the page
        if (window.scrollY < 200) {
          setActiveSection(null);
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      threshold: 0.3,
      rootMargin: "-80px 0px 0px 0px",
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [pathname]);

  /* ── Lock body scroll + Escape + focus hand-off when mobile menu open ── */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileOpen(false);
      };
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", onKeyDown);
        hamburgerRef.current?.focus();
      };
    }
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  function isLinkActive(link: { href: string }) {
    const linkPath = link.href.split("#")[0] || "/";
    const hash = link.href.includes("#") ? link.href.split("#")[1] : null;

    // On the home page
    if (pathname === "/") {
      // Anchor link (e.g. /#formations)
      if (hash) {
        return activeSection === hash;
      }
      // "Accueil" link (href="/") — active only when no section is in view
      if (link.href === "/") {
        return activeSection === null;
      }
      return false;
    }

    // On other pages, match by path only (no anchor logic)
    return pathname === linkPath;
  }

  return (
    <>
      {/* ── Desktop / Mobile Top Bar ── */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-surface/80 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(4,14,26,0.6)]"
            : "glass-nav shadow-[0_25px_50px_-12px_rgba(4,14,26,0.4)]"
        }`}
      >
        <div className="flex items-center justify-between px-6 md:px-12 py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 text-2xl font-headline tracking-tighter text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary rounded-sm group">
            <img
              src="/assets/photos/logo-cyan.webp"
              alt="Hippocampus — hippocampe cyan"
              width={56}
              height={56}
              decoding="async"
              className="h-14 w-auto transition-transform duration-700 ease-expo group-hover:scale-110 group-hover:-translate-y-0.5"
            />
            HIPPOCAMPUS
          </Link>

          {/* Center links — hidden on mobile */}
          <ul className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`font-headline text-sm font-medium tracking-wide transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary rounded-sm ${
                      active
                        ? "text-primary border-b-2 border-primary pb-1"
                        : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* CTA — hidden on mobile */}
          <Link
            href="/le-club#contact"
            className="hidden md:inline-block bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-3 rounded-lg font-bold tracking-wide hover:shadow-[0_0_20px_rgba(71,234,237,0.4)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-700"
          >
            R&eacute;server
          </Link>

          {/* Hamburger — mobile only */}
          <button
            ref={hamburgerRef}
            type="button"
            aria-label="Ouvrir le menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="md:hidden relative w-8 h-6 flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary rounded-sm"
            onClick={() => setMobileOpen(true)}
          >
            <span className="block h-0.5 w-full bg-on-surface rounded-full" />
            <span className="block h-0.5 w-full bg-on-surface rounded-full" />
            <span className="block h-0.5 w-full bg-on-surface rounded-full" />
          </button>
        </div>
      </nav>

      {/* ── Mobile Fullscreen Overlay ── */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        inert={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-surface/90 backdrop-blur-2xl"
          onClick={closeMobile}
        />

        {/* Panel */}
        <div
          className={`absolute inset-y-0 right-0 w-full max-w-sm glass-panel flex flex-col transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Close button */}
          <div className="flex justify-end px-6 py-6">
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Fermer le menu"
              className="relative w-8 h-8 hover:scale-110 active:scale-95 transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary rounded-sm"
              onClick={closeMobile}
            >
              <span className="absolute top-1/2 left-0 w-full h-0.5 bg-on-surface rounded-full rotate-45 -translate-y-1/2" />
              <span className="absolute top-1/2 left-0 w-full h-0.5 bg-on-surface rounded-full -rotate-45 -translate-y-1/2" />
            </button>
          </div>

          {/* Mobile links */}
          <nav className="flex flex-col gap-8 px-10 pt-8">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className={`font-headline text-3xl tracking-tight leading-tight transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary rounded-sm ${
                    active ? "text-primary" : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile CTA */}
            <Link
              href="/le-club#contact"
              onClick={closeMobile}
              className="mt-8 inline-block text-center bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-lg font-bold tracking-wide text-lg hover:shadow-[0_0_20px_rgba(71,234,237,0.4)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-500"
            >
              R&eacute;server
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
