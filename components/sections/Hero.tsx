"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Config ─── */
/* 418 frames: the original 24fps clip motion-interpolated to 60fps
   (minterpolate mci) — real in-betweens, no duplicated frames.
   Two encoded sets: 1920px masters for desktop, 960px for mobile. */
const FRAME_COUNT = 418;
const EXPO_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
/* Exponential smoothing time constant (ms) — how fast the rendered frame
   chases the scroll target. Lower = snappier, higher = more inertia. */
const SMOOTHING_TAU = 90;
/* Coarse-lattice loading step: every Nth frame loads first so fast scrubbing
   always finds a nearby frame while the gaps fill in. */
const LATTICE_STEP = 16;
/* HTTP/2 multiplexes: with ~15KB frames, round trips dominate, so a wide
   pipe shortens the rough first seconds far more than it costs. */
const MAX_PARALLEL_LOADS = 14;
/* Decoded-bitmap budget: holding all 418 frames decoded would cost ~3.4GB
   at 1920px. Instead the compressed blobs stay in memory (~20MB) and only
   the lattice plus a sliding window around the scrub position is decoded. */
const MAX_PARALLEL_DECODES = 4;
const DECODE_WINDOW = 16; // full-res frames kept within ±N of the position
const EVICT_MARGIN = 10; // hysteresis before closing a decoded frame
/* On desktop the always-decoded lattice fallbacks are downsized: they only
   show mid-fast-scrub where softness is invisible, and 27 full 1920 bitmaps
   would pin ~220MB for nothing. */
const LATTICE_FALLBACK_WIDTH = 960;

type FrameRes = 1920 | 960;

function getFrameSrc(index: number, res: FrameRes): string {
  return `/assets/video/frames/${res}/frame_${String(index).padStart(3, "0")}.webp`;
}

/* ─── Panel definitions ─── */
interface PanelDef {
  range: [number, number];
  label: string;
  heading: string;
  body?: string;
  cta?: { text: string; href: string };
  scrollHint?: boolean;
}

const PANELS: PanelDef[] = [
  {
    range: [0, 0.28],
    label: "",
    heading: "HIPPOCAMPUS",
    scrollHint: true,
  },
  {
    range: [0.32, 0.63],
    label: "Depuis 2010",
    heading: "L'Art de la Plongée",
    body: "Là où la surface s'efface, un autre monde commence. Silence, apesanteur, émerveillement — chaque immersion est une rencontre avec l'invisible.",
  },
  {
    range: [0.67, 1.0],
    label: "Rejoignez-nous",
    heading: "Plus de 15 ans d'aventure",
    body: "Formation, exploration et convivialité dans l'Aisne et au-delà. Du baptême aux expéditions en mer, nous partageons la passion des profondeurs.",
  },
];

/* ─── Panel opacity calculator (scroll-driven, no CSS transitions) ─── */
function getPanelStyle(
  p: number,
  start: number,
  end: number
): React.CSSProperties {
  const fadeIn = 0.04;
  const fadeOut = 0.04;

  let opacity = 0;
  if (p >= start && p <= end) {
    if (p < start + fadeIn && start > 0) {
      // First panel (start === 0) stays fully visible at rest
      opacity = (p - start) / fadeIn;
    } else if (p <= end - fadeOut) {
      opacity = 1;
    } else {
      opacity = (end - p) / fadeOut;
    }
  }

  const translateY = opacity < 1 ? (1 - opacity) * 24 : 0;
  const blur = opacity < 1 ? (1 - opacity) * 4 : 0;

  return {
    opacity,
    transform: `translateY(${translateY}px)`,
    filter: `blur(${blur}px)`,
    pointerEvents: opacity > 0.1 ? "auto" : "none",
    transition: "none",
  };
}

/* ─── Panel component ─── */
/* Text-shadow glow for floating hero title (no glass card) */
const HERO_TEXT_SHADOW = [
  "0 0 20px rgba(4, 14, 26, 0.9)",
  "0 0 40px rgba(4, 14, 26, 0.8)",
  "0 0 80px rgba(4, 14, 26, 0.6)",
  "0 2px 4px rgba(0, 0, 0, 0.5)",
].join(", ");

function TextPanel({
  panel,
  progress,
}: {
  panel: PanelDef;
  progress: number;
}) {
  const style = getPanelStyle(progress, panel.range[0], panel.range[1]);
  const isHeroTitle = panel.scrollHint; // first panel = floating title only

  if (isHeroTitle) {
    return (
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 md:px-10"
        style={style}
      >
        <div
          className="text-center relative animate-fade-up"
          style={{ animationDuration: "1.2s" }}
        >
          {/* Large seahorse watermark behind the title */}
          <img
            src="/assets/photos/logo-cyan.webp"
            alt=""
            width={420}
            height={420}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[280px] md:h-[360px] lg:h-[420px] w-auto opacity-[0.15] pointer-events-none select-none"
            aria-hidden="true"
          />
          {/* Floating heading with text-shadow glow */}
          <h1
            className="relative font-headline text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-on-surface md:text-7xl lg:text-8xl"
            style={{ textShadow: HERO_TEXT_SHADOW }}
          >
            {panel.heading}
          </h1>

          {/* Scroll hint */}
          <div
            className="mt-10 flex flex-col items-center gap-2"
            style={{
              opacity: progress < 0.12 ? 1 : 0,
              transition: `opacity 400ms ${EXPO_EASE}`,
            }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-[0.25em] text-outline"
              style={{ textShadow: "0 0 10px rgba(4,14,26,0.8)" }}
            >
              Scrollez pour plonger
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="animate-bounce text-primary"
            >
              <path
                d="M4 8l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 md:px-10"
      style={style}
    >
      <div
        className="glass-panel pointer-events-auto max-w-[620px] rounded-[1.5rem] md:rounded-[2rem] px-6 py-8 md:px-12 md:py-14 text-center"
        style={{
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Label pill */}
        {panel.label && (
          <span
            className="inline-block rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary"
            style={{
              background: "rgba(56, 217, 220, 0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            {panel.label}
          </span>
        )}

        {/* Heading */}
        <h2 className="mt-5 font-headline text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-on-surface md:text-6xl lg:text-7xl">
          {panel.heading}
        </h2>

        {/* Body text */}
        {panel.body && (
          <p className="mt-5 text-base font-light leading-relaxed text-secondary md:text-lg max-w-[50ch] mx-auto">
            {panel.body}
          </p>
        )}

        {/* CTA button */}
        {panel.cta && (
          <a
            href={panel.cta.href}
            className="group mt-8 inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-[15px] font-semibold tracking-wide text-on-primary transition-transform duration-500 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            style={{ transitionTimingFunction: EXPO_EASE }}
          >
            {panel.cta.text}
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-on-primary/10 transition-transform duration-700"
              style={{ transitionTimingFunction: EXPO_EASE }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="transition-transform duration-700 group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105"
                style={{ transitionTimingFunction: EXPO_EASE }}
              >
                <path
                  d="M1 7h12M8 2l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
        )}
      </div>
    </div>
  );
}

/* ─── Main Hero ─── */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bitmapsRef = useRef<(ImageBitmap | null)[]>([]);
  const renderedFrameRef = useRef(0); // float position the canvas shows
  const lastDrawnRef = useRef(-1); // last float position actually drawn
  const needsRedrawRef = useRef(false); // resize or a better frame arrived
  const maintainWindowRef = useRef<() => void>(() => {});
  const lastWindowCenterRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const inViewRef = useRef(true);
  const lastTickRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  /* Resolution is picked once: a resize across the breakpoint keeps the
     already-loaded set (drawCover scales it) rather than re-downloading. */
  const [res] = useState<FrameRes>(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches
      ? 1920
      : 960
  );

  /* Detect reduced motion preference */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Nearest loaded bitmap to an index — fallback while gaps fill in */
  const nearestLoaded = useCallback((index: number): ImageBitmap | null => {
    const bitmaps = bitmapsRef.current;
    if (bitmaps[index]) return bitmaps[index];
    for (let d = 1; d < FRAME_COUNT; d++) {
      const lo = bitmaps[index - d];
      if (lo) return lo;
      const hi = bitmaps[index + d];
      if (hi) return hi;
    }
    return null;
  }, []);

  /* Draw a (possibly fractional) frame position with crossfade between
     the two adjacent frames — sub-frame smoothness, no visible stepping. */
  const drawAt = useCallback(
    (pos: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const i0 = Math.floor(pos);
      const frac = pos - i0;
      const i1 = Math.min(i0 + 1, FRAME_COUNT - 1);
      const base = nearestLoaded(i0);
      if (!base) return;
      const next = frac > 0.004 && i1 !== i0 ? bitmapsRef.current[i1] : null;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();

      // Only resize canvas buffer when dimensions change
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw image covering the canvas (object-cover behavior)
      const drawCover = (img: ImageBitmap, alpha: number) => {
        const imgRatio = img.width / img.height;
        const canvasRatio = rect.width / rect.height;
        let drawWidth: number,
          drawHeight: number,
          drawX: number,
          drawY: number;

        if (imgRatio > canvasRatio) {
          drawHeight = rect.height;
          drawWidth = drawHeight * imgRatio;
          drawX = (rect.width - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = rect.width;
          drawHeight = drawWidth / imgRatio;
          drawX = 0;
          drawY = (rect.height - drawHeight) / 2;
        }

        ctx.globalAlpha = alpha;
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      };

      drawCover(base, 1);
      if (next && next !== base) drawCover(next, frac);
      ctx.globalAlpha = 1;

      lastDrawnRef.current = pos;
      needsRedrawRef.current = false;
    },
    [nearestLoaded]
  );

  /* Frame loading, two layers.
     Network: the coarse lattice downloads first so fast scrubbing always
     lands near a real frame; after that, whichever unfetched frame is
     closest to the live scroll position wins. Compressed blobs are all
     kept — the full set is ~20MB.
     Decode: only the lattice plus a sliding window around the scrub
     position holds decoded ImageBitmaps; frames leaving the window are
     closed. Decoding all 418 would cost gigabytes of raster memory.
     createImageBitmap decodes off the main thread — no decode jank. */
  useEffect(() => {
    if (prefersReducedMotion) return;

    const blobs: (Blob | null)[] = new Array(FRAME_COUNT).fill(null);
    const bitmaps: (ImageBitmap | null)[] = new Array(FRAME_COUNT).fill(null);
    bitmapsRef.current = bitmaps;
    const decoding = new Set<number>();
    const controller = new AbortController();
    const isLattice = (i: number) => i % LATTICE_STEP === 0;

    const decodeFrame = (i: number): Promise<ImageBitmap> => {
      const blob = blobs[i]!;
      if (res === 1920 && isLattice(i)) {
        return createImageBitmap(blob, {
          resizeWidth: LATTICE_FALLBACK_WIDTH,
          resizeQuality: "high",
          // Safari < 15 lacks resize options — fall back to full size
        }).catch(() => createImageBitmap(blob));
      }
      return createImageBitmap(blob);
    };

    const maintainWindow = () => {
      if (controller.signal.aborted) return;
      const center = renderedFrameRef.current;

      // Evict full-res frames that drifted out of the window (lattice stays)
      for (let i = 0; i < FRAME_COUNT; i++) {
        if (
          bitmaps[i] &&
          !isLattice(i) &&
          Math.abs(i - center) > DECODE_WINDOW + EVICT_MARGIN
        ) {
          bitmaps[i]!.close();
          bitmaps[i] = null;
        }
      }

      // Decode wanted frames, nearest to the scrub position first
      while (decoding.size < MAX_PARALLEL_DECODES) {
        let best = -1;
        let bestDist = Infinity;
        for (let i = 0; i < FRAME_COUNT; i++) {
          if (bitmaps[i] || !blobs[i] || decoding.has(i)) continue;
          const d = Math.abs(i - center);
          if (!isLattice(i) && d > DECODE_WINDOW) continue;
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        }
        if (best < 0) break;
        const index = best;
        decoding.add(index);
        decodeFrame(index)
          .then((bitmap) => {
            decoding.delete(index);
            if (controller.signal.aborted) {
              bitmap.close();
              return;
            }
            // Re-check: the scrub may have moved on while we decoded
            const d = Math.abs(index - renderedFrameRef.current);
            if (!isLattice(index) && d > DECODE_WINDOW + EVICT_MARGIN) {
              bitmap.close();
            } else {
              bitmaps[index] = bitmap;
              // Repaint on arrival: a better frame replaces a distant
              // fallback without waiting for the next scroll
              needsRedrawRef.current = true;
              if (index === 0) setImagesLoaded(true);
            }
            maintainWindow();
          })
          .catch(() => {
            decoding.delete(index);
          });
      }
    };
    maintainWindowRef.current = maintainWindow;

    const lattice: number[] = [];
    for (let i = 0; i < FRAME_COUNT; i += LATTICE_STEP) lattice.push(i);

    /* Binary-refinement download order: after the lattice, fetch the frames
       that halve the largest remaining gap EVERYWHERE (step 8, then 4, 2, 1)
       instead of perfecting one region while the rest stays coarse. The whole
       scrub gets uniformly smoother with every pass; within a pass, frames
       nearest the live scroll position go first. */
    const levels: Set<number>[] = [];
    for (let step = LATTICE_STEP / 2; step >= 1; step /= 2) {
      const level = new Set<number>();
      for (let i = step; i < FRAME_COUNT; i += step * 2) level.add(i);
      levels.push(level);
    }

    let latticeCursor = 0;
    const nextIndex = (): number => {
      if (latticeCursor < lattice.length) return lattice[latticeCursor++];
      const level = levels.find((l) => l.size > 0);
      if (!level) return -1;
      let best = -1;
      let bestDist = Infinity;
      const center = renderedFrameRef.current;
      for (const i of level) {
        const d = Math.abs(i - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      level.delete(best);
      return best;
    };

    const pump = () => {
      const index = nextIndex();
      if (index < 0) return;
      fetch(getFrameSrc(index + 1, res), { signal: controller.signal })
        .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
        .then((blob) => {
          if (controller.signal.aborted) return;
          blobs[index] = blob;
          maintainWindow();
        })
        .catch(() => {
          /* aborted or network error — nearestLoaded covers the gap */
        })
        .finally(() => {
          if (!controller.signal.aborted) pump();
        });
    };
    for (let i = 0; i < MAX_PARALLEL_LOADS; i++) pump();

    return () => {
      controller.abort();
      maintainWindowRef.current = () => {};
      for (const b of bitmaps) b?.close();
      bitmapsRef.current = [];
    };
  }, [prefersReducedMotion, res]);

  /* Render loop — runs while the hero is on screen. Reads scroll position,
     chases it with time-normalized exponential smoothing, redraws only when
     the rendered position actually moved. */
  useEffect(() => {
    if (!imagesLoaded || prefersReducedMotion) return;

    const tick = (now: number) => {
      rafRef.current = null;
      if (!inViewRef.current) return; // restarted by the observer

      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable > 0) {
        const p = Math.max(0, Math.min(1, -rect.top / scrollable));

        // Quantized so React re-renders only on visible panel changes
        setProgress((prev) =>
          Math.abs(prev - p) > 0.0015 || p === 0 || p === 1 ? p : prev
        );

        const target = p * (FRAME_COUNT - 1);
        const dt = Math.min(Math.max(now - lastTickRef.current, 1), 64);
        const alpha = 1 - Math.exp(-dt / SMOOTHING_TAU);
        let rendered =
          renderedFrameRef.current +
          (target - renderedFrameRef.current) * alpha;
        if (Math.abs(target - rendered) < 0.01) rendered = target;
        renderedFrameRef.current = rendered;

        // Recenter the decode window once the scrub has moved meaningfully
        if (Math.abs(rendered - lastWindowCenterRef.current) >= 4) {
          lastWindowCenterRef.current = rendered;
          maintainWindowRef.current();
        }

        if (
          Math.abs(rendered - lastDrawnRef.current) > 0.004 ||
          needsRedrawRef.current
        ) {
          drawAt(rendered);
        }
      }

      lastTickRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (rafRef.current === null) {
        lastTickRef.current = performance.now();
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) start();
      },
      { rootMargin: "200px 0px" }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    // Initial paint: snap straight to the current scroll position
    const section = sectionRef.current;
    if (section) {
      const scrollable = section.offsetHeight - window.innerHeight;
      const p =
        scrollable > 0
          ? Math.max(
              0,
              Math.min(1, -section.getBoundingClientRect().top / scrollable)
            )
          : 0;
      renderedFrameRef.current = p * (FRAME_COUNT - 1);
      drawAt(renderedFrameRef.current);
    }
    start();

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [imagesLoaded, prefersReducedMotion, drawAt]);

  /* Handle resize — redraw current frame at new dimensions */
  useEffect(() => {
    if (!imagesLoaded) return;
    const handleResize = () => {
      needsRedrawRef.current = true;
      drawAt(renderedFrameRef.current);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imagesLoaded, drawAt]);

  /* ─── Reduced motion fallback: static poster + text ─── */
  if (prefersReducedMotion) {
    return (
      <section className="relative min-h-dvh flex items-center overflow-hidden -mt-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/video/hero-poster.webp')",
            backgroundColor: "#020f1c",
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at center, transparent 30%, #040E1A 75%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-48 deep-fade" />

        {/* Static content */}
        <div className="relative z-10 flex min-h-dvh w-full items-center justify-center px-4 md:px-10">
          <div className="text-center">
            <h1
              className="font-headline text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-on-surface md:text-7xl lg:text-8xl"
              style={{ textShadow: HERO_TEXT_SHADOW }}
            >
              HIPPOCAMPUS
            </h1>
            <p
              className="mt-5 text-base font-light leading-relaxed text-secondary md:text-lg max-w-[50ch] mx-auto"
              style={{ textShadow: "0 0 10px rgba(4,14,26,0.8)" }}
            >
              Depuis plus de 15 ans, nous formons et accompagnons les plongeurs
              dans la découverte des profondeurs. Sécurité, convivialité et
              amour de la mer, ici dans l&apos;Aisne.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ─── Full scroll-driven hero ─── */
  return (
    <section
      ref={sectionRef}
      className="relative -mt-24"
      style={{ height: "350vh" }}
    >
      {/* Lattice preloads in the initial HTML: the backbone frames start
          downloading with the page, before hydration. React 19 hoists these
          into <head>; the media attribute picks the right resolution set.
          crossOrigin matches fetch()'s cors mode — without it every preload
          goes unused and the frames download twice. */}
      {Array.from({ length: Math.ceil(FRAME_COUNT / LATTICE_STEP) }, (_, k) => {
        const frame = k * LATTICE_STEP + 1;
        return [
          <link
            key={`pre-1920-${frame}`}
            rel="preload"
            as="fetch"
            crossOrigin="anonymous"
            media="(min-width: 1024px)"
            href={getFrameSrc(frame, 1920)}
          />,
          <link
            key={`pre-960-${frame}`}
            rel="preload"
            as="fetch"
            crossOrigin="anonymous"
            media="(max-width: 1023.98px)"
            href={getFrameSrc(frame, 960)}
          />,
        ];
      })}
      <div className="sticky top-0 h-dvh overflow-hidden">
        {/* Poster fallback while frames load */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/video/hero-poster.webp')",
            backgroundColor: "#020f1c",
            opacity: imagesLoaded ? 0 : 1,
            transition: "opacity 600ms ease-out",
          }}
        />

        {/* Canvas for frame sequence */}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* Radial vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at center, transparent 30%, #040E1A 75%)",
          }}
        />

        {/* Top fade */}
        <div
          className="absolute inset-x-0 top-0 h-32 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, #040E1A, transparent)",
          }}
        />

        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
          style={{
            background: "linear-gradient(to top, #040E1A, transparent)",
          }}
        />

        {/* Subtle cyan glow at bottom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 90%, rgba(56,217,220,0.04) 0%, transparent 50%)",
          }}
        />

        {/* Text overlay panels */}
        {PANELS.map((panel, i) => (
          <TextPanel key={i} panel={panel} progress={progress} />
        ))}
      </div>
    </section>
  );
}

export default Hero;
