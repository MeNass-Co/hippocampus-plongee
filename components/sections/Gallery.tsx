"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionTitle from "@/components/ui/SectionTitle";

const GALLERY_ITEMS = [
  {
    caption: "Vie sous-marine",
    location: "Macro récif",
    gradient: "linear-gradient(135deg, #003738 0%, #005354 50%, #0a2540 100%)",
    image: "/assets/photos/gallery-01.webp",
  },
  {
    caption: "Exploration",
    location: "Grotte sous-marine",
    gradient: "linear-gradient(135deg, #0e1d2a 0%, #1d2b39 50%, #003738 100%)",
    image: "/assets/photos/gallery-02.webp",
  },
  {
    caption: "Récif corallien",
    location: "Vue aérienne",
    gradient: "linear-gradient(135deg, #005354 0%, #003738 50%, #13212e 100%)",
    image: "/assets/photos/gallery-03.webp",
  },
  {
    caption: "En immersion",
    location: "Plongeuse",
    gradient: "linear-gradient(135deg, #13212e 0%, #0a2540 50%, #005354 100%)",
    image: "/assets/photos/gallery-04.webp",
  },
  {
    caption: "Vie marine",
    location: "Banc de poissons",
    gradient: "linear-gradient(135deg, #1d2b39 0%, #005354 50%, #003738 100%)",
    image: "/assets/photos/gallery-05.webp",
  },
  {
    caption: "Paysage sous-marin",
    location: "Forêt de kelp",
    gradient: "linear-gradient(135deg, #0a2540 0%, #003738 50%, #1d2b39 100%)",
    image: "/assets/photos/gallery-06.webp",
  },
] as const;

export function Gallery() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const openLightbox = (index: number) => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
    previousFocusRef.current?.focus();
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? GALLERY_ITEMS.length - 1 : prev - 1
    );
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === GALLERY_ITEMS.length - 1 ? 0 : prev + 1
    );
  }, []);

  /* Scroll nav for the horizontal strip */
  const scrollBy = useCallback((direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cardWidth = container.firstElementChild
      ? (container.firstElementChild as HTMLElement).offsetWidth
      : 400;
    const amount = direction === "left" ? -cardWidth - 32 : cardWidth + 32;
    container.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();

      if (e.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeLightbox, goToPrev, goToNext]);

  const currentItem = GALLERY_ITEMS[currentIndex];

  return (
    <section id="galerie" className="py-16 md:py-32 overflow-hidden relative border-t border-on-surface/[0.06]" style={{ backgroundColor: 'rgba(2, 10, 20, 0.85)' }}>
      {/* Decorative blur */}
      <div className="absolute top-1/3 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Section title */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-10 md:mb-16">
        <ScrollReveal animation="fade-up">
          <SectionTitle
            overline="Nos Aventures"
            title="Galerie"
            align="center"
          />
        </ScrollReveal>
      </div>

      {/* Horizontal scroll strip */}
      <div className="relative">
        {/* Scroll container */}
        <ScrollReveal animation="fade-up" delay={200}>
          <div
            ref={scrollContainerRef}
            className="flex gap-6 md:gap-8 px-6 md:px-12 scrollbar-hide snap-x snap-mandatory"
            style={{
              scrollBehavior: "smooth",
              overflowX: "auto",
              overflowY: "hidden",
              overscrollBehaviorX: "contain",
              overscrollBehaviorY: "auto",
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y pan-x",
            }}
          >
            {GALLERY_ITEMS.map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 snap-center"
                style={{ width: "clamp(260px, 70vw, 500px)" }}
              >
                {/* Card-in-card frame */}
                <div className="card-frame">
                  <div className="card-frame-inner">
                    <button
                      type="button"
                      onClick={() => openLightbox(i)}
                      className="w-full relative group cursor-pointer block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] transition-transform duration-300 ease-expo"
                    >
                      <div
                        className="w-full aspect-[4/5] transition-transform duration-700 ease-expo group-hover:scale-105 overflow-hidden"
                        style={{ background: item.gradient }}
                      >
                        <img
                          src={item.image}
                          alt={item.caption}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-expo">
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(2,15,28,0.85) 0%, transparent 60%)",
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-primary text-xs">Voir</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Caption below card */}
                <div className="mt-4 px-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant/50">
                    {item.location}
                  </p>
                  <h3 className="mt-1 font-headline text-lg font-light tracking-tight text-on-surface">
                    {item.caption}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Navigation arrows */}
        <button
          type="button"
          onClick={() => scrollBy("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm hidden md:flex items-center justify-center text-on-surface hover:bg-primary/20 transition-colors duration-300 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Défiler à gauche"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 4l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scrollBy("right")}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm hidden md:flex items-center justify-center text-on-surface hover:bg-primary/20 transition-colors duration-300 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Défiler à droite"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 pointer-events-none z-10" style={{ background: 'linear-gradient(to right, rgba(2, 10, 20, 0.85), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 pointer-events-none z-10" style={{ background: 'linear-gradient(to left, rgba(2, 10, 20, 0.85), transparent)' }} />
      </div>

      {/* Lightbox dialog */}
      {isOpen && (
        <dialog
          ref={dialogRef}
          open
          aria-modal="true"
          aria-label={`Galerie photo — ${currentItem.caption}`}
          className="fixed inset-0 z-50 w-full h-full bg-transparent m-0 p-0 max-w-none max-h-none animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-surface/90 backdrop-blur-sm"
            onClick={closeLightbox}
          />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-center w-full h-full p-6 md:p-16 pointer-events-none">
            {/* Close button */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-on-surface hover:text-primary hover:scale-110 active:scale-95 transition-all duration-300 ease-expo z-20 pointer-events-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-sm"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Prev arrow */}
            <button
              type="button"
              onClick={goToPrev}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 pointer-events-auto w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center text-on-surface hover:bg-primary/20 transition-colors duration-300 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Image précédente"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 4l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Next arrow */}
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 pointer-events-auto w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center text-on-surface hover:bg-primary/20 transition-colors duration-300 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Image suivante"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Full-size image */}
            <div className="pointer-events-auto max-w-4xl w-full">
              <div
                className="w-full aspect-[4/3] rounded-xl overflow-hidden relative"
                style={{ background: currentItem.gradient }}
              >
                <img
                  src={currentItem.image}
                  alt={currentItem.caption}
                  className="w-full h-full object-cover"
                  decoding="async"
                />
              </div>
              <p className="text-center text-on-surface mt-4 font-headline text-lg font-medium">
                {currentItem.caption}
              </p>
              <p className="text-center text-on-surface-variant text-sm mt-1 tabular-nums">
                {currentIndex + 1} / {GALLERY_ITEMS.length}
              </p>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}

export default Gallery;
