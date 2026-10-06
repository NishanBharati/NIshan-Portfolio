import { useEffect, useRef, type CSSProperties } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';

type AnimatedTextProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
};

const DIM = 0.2;

/**
 * Scroll-linked, character-by-character reveal. Each character is a plain <span> rendered exactly
 * once as real text (crawlers, copy-paste and screen readers read the plain sentence). One scroll
 * listener updates all opacities directly, instead of one animated component per character, which
 * keeps hydration cheap.
 */
export default function AnimatedText({ text, className, style }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const chars = useRef<HTMLSpanElement[]>([]);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });

  const total = text.length;
  const paint = (progress: number) => {
    const list = chars.current;
    for (let i = 0; i < list.length; i++) {
      const el = list[i];
      if (!el) continue;
      // Same mapping as before: character i fades 0.2 -> 1 while progress moves through [i/total, (i+1)/total].
      const t = Math.min(1, Math.max(0, progress * total - Number(el.dataset.i)));
      el.style.opacity = String(DIM + (1 - DIM) * t);
    }
  };

  useMotionValueEvent(scrollYProgress, 'change', paint);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => paint(scrollYProgress.get()), []);

  const words = text.split(' ');
  let cursor = 0;
  chars.current = [];

  return (
    <p ref={ref} className={className} style={style}>
      {words.map((word, wi) => {
        const start = cursor;
        cursor += word.length + 1; // +1 for the trailing space
        return (
          <span key={wi}>
            {/* Words stay unbroken; each character animates independently. */}
            <span className="inline-block whitespace-nowrap">
              {word.split('').map((char, ci) => (
                <span
                  key={ci}
                  data-i={start + ci}
                  ref={(el) => {
                    if (el) chars.current[start + ci] = el;
                  }}
                  style={{ opacity: DIM }}
                >
                  {char}
                </span>
              ))}
            </span>
            {wi < words.length - 1 && ' '}
          </span>
        );
      })}
    </p>
  );
}
