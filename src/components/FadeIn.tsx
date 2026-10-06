import { useMemo, type ElementType, type ReactNode } from 'react';
import { motion } from 'framer-motion';

type FadeInProps = {
  children?: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  id?: string;
  'aria-label'?: string;
};

const EASE = [0.25, 0.1, 0.25, 1] as const;

export default function FadeIn({
  children,
  as = 'div',
  className,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  id,
  'aria-label': ariaLabel,
}: FadeInProps) {
  // Memoised so the motion component identity is stable between renders.
  const MotionTag = useMemo(() => motion.create(as), [as]);

  return (
    <MotionTag
      id={id}
      aria-label={ariaLabel}
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}
