import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarkdownProps = {
  children: string;
  className?: string;
};

/** Renders post content. Raw HTML in the source is ignored, so content can't inject scripts. */
export default function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: label }) => {
            const external = href?.startsWith('http');
            return (
              <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
                {label}
              </a>
            );
          },
          img: ({ src, alt }) => <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading="lazy" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
