import type { CSSProperties, ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /**
   * `rise` slides in without fading (wrap it in `overflow-hidden` for a mask reveal). Use it for a page's
   * main heading: browsers don't record LCP for content that starts at opacity 0.
   */
  rise?: boolean;
};

/**
 * Above-the-fold entrance animation in pure CSS (.css-fade-up / .css-rise in index.css). Unlike
 * <FadeIn>, it starts as soon as the prerendered HTML paints, without waiting for JavaScript.
 */
export default function Reveal({ children, className = '', delay = 0, y = 30, rise = false }: RevealProps) {
  const style = { animationDelay: `${delay}s`, '--fade-y': `${y}px` } as CSSProperties;
  return (
    <div className={`${rise ? 'css-rise' : 'css-fade-up'} ${className}`} style={style}>
      {children}
    </div>
  );
}
