import { useRef, type CSSProperties } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

type AnimatedTextProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
};

export default function AnimatedText({ text, className, style }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });

  const total = text.length;
  const words = text.split(' ');
  let cursor = 0;

  return (
    <p ref={ref} className={className} style={style} aria-label={text}>
      {words.map((word, wi) => {
        const start = cursor;
        cursor += word.length + 1; // +1 for the trailing space
        return (
          // Words stay unbroken; each character animates independently.
          <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
            {word.split('').map((char, ci) => {
              const i = start + ci;
              return (
                <Char key={ci} progress={scrollYProgress} range={[i / total, (i + 1) / total]}>
                  {char}
                </Char>
              );
            })}
            {wi < words.length - 1 && <span>&nbsp;</span>}
          </span>
        );
      })}
    </p>
  );
}

type CharProps = {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
};

function Char({ children, progress, range }: CharProps) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <span className="relative">
      <span className="invisible">{children}</span>
      <motion.span className="absolute left-0 top-0" style={{ opacity }}>
        {children}
      </motion.span>
    </span>
  );
}
