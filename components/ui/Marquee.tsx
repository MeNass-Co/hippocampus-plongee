import { memo } from "react";

interface MarqueeProps {
  /** Array of words to display in the scrolling band */
  words?: string[];
}

const DEFAULT_WORDS = [
  "Plongée",
  "Exploration",
  "Profondeur",
  "Océan",
  "Découverte",
  "Aventure",
  "Liberté",
  "Courant",
];

export function Marquee({ words = DEFAULT_WORDS }: MarqueeProps) {
  const content = words.map((word, i) => (
    <span key={i} className="flex items-center gap-12">
      <span>{word}</span>
      <span className="text-primary/40">/</span>
    </span>
  ));

  return (
    <div aria-hidden="true" className="overflow-hidden border-y border-on-surface/[0.06] py-6" style={{ backgroundColor: 'rgba(4, 14, 26, 0.85)' }}>
      <div className="marquee-track flex w-max items-center gap-12 whitespace-nowrap font-headline text-2xl font-light tracking-tight text-on-surface/20">
        {/* First copy */}
        <div className="flex items-center gap-12">
          {content}
        </div>
        {/* Duplicate for seamless loop */}
        <div className="flex items-center gap-12">
          {content}
        </div>
      </div>
    </div>
  );
}

export default memo(Marquee);
