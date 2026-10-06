import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import LiveProjectButton from '../components/LiveProjectButton';
import { FALLBACK_PROJECTS } from '../data/content';
import { fetchPublishedProjects, type ProjectImage, type ShowcaseProject } from '../lib/projects';
import { isSupabaseConfigured } from '../lib/supabase';
import { getInitialData } from '../lib/initialData';

/**
 * Projects baked in at build time (if any), refreshed from Supabase in the background; the built-in
 * list is used when Supabase is unconfigured or unreachable.
 */
function useShowcaseProjects(): ShowcaseProject[] | null {
  const [projects, setProjects] = useState<ShowcaseProject[] | null>(
    () => getInitialData().projects ?? (isSupabaseConfigured ? null : FALLBACK_PROJECTS),
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    fetchPublishedProjects()
      .then((data) => !cancelled && setProjects(data))
      .catch((error: unknown) => {
        console.error('Failed to load projects, showing built-in list', error);
        if (!cancelled) setProjects((prev) => prev ?? FALLBACK_PROJECTS);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return projects;
}

export default function ProjectsSection() {
  const projects = useShowcaseProjects();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section
      id="projects"
      className="relative z-10 -mt-10 rounded-t-[40px] bg-section-black px-5 pb-28 pt-20 sm:-mt-12 sm:pb-32 md:pb-40 sm:rounded-t-[50px] sm:px-8 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pt-32"
    >
      <FadeIn y={40}>
        <h2
          className="hero-heading mb-16 text-center font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Projects
        </h2>
      </FadeIn>

      <div ref={containerRef} className="mx-auto max-w-7xl">
        {!projects && <ProjectCardSkeleton />}
        {projects?.length === 0 && (
          <p className="mx-auto max-w-xl rounded-[40px] border-2 border-dashed border-[#D7E2EA]/20 px-8 py-14 text-center font-light text-[#D7E2EA]/60 sm:rounded-[50px]">
            New projects are being prepared. Check back soon.
          </p>
        )}
        {projects?.map((project, i) => (
          <ProjectCard
            key={project.key}
            project={project}
            index={i}
            progress={scrollYProgress}
            range={[i / projects.length, 1]}
            targetScale={1 - (projects.length - 1 - i) * 0.03}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectCardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading projects" className="rounded-[40px] border-2 border-[#D7E2EA]/20 p-4 sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8">
      <div className="mb-6 flex items-end gap-6">
        <div className="h-20 w-24 animate-pulse rounded-3xl bg-[#D7E2EA]/10 md:h-28 md:w-36" />
        <div className="flex flex-1 flex-col gap-3">
          <div className="h-3 w-32 animate-pulse rounded-full bg-[#D7E2EA]/10" />
          <div className="h-6 w-2/3 max-w-md animate-pulse rounded-full bg-[#D7E2EA]/10" />
        </div>
      </div>
      <div className="flex gap-3 sm:gap-4">
        <div className="flex w-[40%] flex-col gap-3 sm:gap-4">
          <div className="animate-pulse rounded-[40px] bg-[#D7E2EA]/10 md:rounded-[60px]" style={{ height: 'clamp(130px, 16vw, 230px)' }} />
          <div className="animate-pulse rounded-[40px] bg-[#D7E2EA]/10 md:rounded-[60px]" style={{ height: 'clamp(160px, 22vw, 340px)' }} />
        </div>
        <div className="w-[60%] animate-pulse rounded-[40px] bg-[#D7E2EA]/10 md:rounded-[60px]" />
      </div>
    </div>
  );
}

type ProjectCardProps = {
  project: ShowcaseProject;
  index: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
};

function ProjectCard({ project, index, progress, range, targetScale }: ProjectCardProps) {
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div className="sticky top-24 h-[85vh] md:top-32">
      <motion.article
        className="relative origin-top rounded-[40px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8"
        style={{ scale, top: `${index * 28}px` }}
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4 sm:mb-6 md:mb-8">
          <div className="flex items-end gap-4 sm:gap-6">
            <span
              className="font-black leading-none text-[#D7E2EA]"
              style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-1 pb-1 sm:pb-2">
              <span
                className="font-light uppercase tracking-widest text-[#D7E2EA]/60"
                style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}
              >
                {project.category}
              </span>
              <h3
                className="font-medium uppercase leading-tight text-[#D7E2EA]"
                style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
              >
                {project.name}
              </h3>
              <p
                className="line-clamp-2 max-w-xl font-light leading-relaxed text-[#D7E2EA]/60"
                style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1rem)' }}
              >
                {project.description}
              </p>
              {(project.problem || project.approach || project.result) && (
                <dl className="mt-2 grid max-w-xl gap-x-4 gap-y-1 text-[#D7E2EA]/70 sm:grid-cols-[auto_1fr]" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.9rem)' }}>
                  {(
                    [
                      ['Problem', project.problem],
                      ['Approach', project.approach],
                      ['Result', project.result],
                    ] as const
                  )
                    .filter(([, value]) => value)
                    .map(([term, value]) => (
                      <div key={term} className="contents">
                        <dt className="font-medium uppercase tracking-wider text-[#D7E2EA]">{term}</dt>
                        <dd className="font-light">{value}</dd>
                      </div>
                    ))}
                </dl>
              )}
              {project.stack && project.stack.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`${project.name} technology stack`}>
                  {project.stack.map((tech) => (
                    <li key={tech} className="rounded-full border border-[#D7E2EA]/30 px-3 py-0.5 text-[11px] font-light uppercase tracking-wider text-[#D7E2EA]">
                      {tech}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {project.live_url && <LiveProjectButton href={project.live_url} projectName={project.name} />}
        </div>

        <div className="flex gap-3 sm:gap-4">
          <div className="flex w-[40%] flex-col gap-3 sm:gap-4">
            <Screenshot image={project.images.colTop} style={{ height: 'clamp(130px, 16vw, 230px)' }} />
            <Screenshot image={project.images.colBottom} style={{ height: 'clamp(160px, 22vw, 340px)' }} />
          </div>
          <div className="w-[60%]">
            <Screenshot image={project.images.tall} className="h-full" />
          </div>
        </div>
      </motion.article>
    </div>
  );
}

type ScreenshotProps = {
  image: ProjectImage;
  className?: string;
  style?: CSSProperties;
};

function Screenshot({ image, className = '', style }: ScreenshotProps) {
  return (
    <img
      src={image.src}
      alt={image.alt}
      loading="lazy"
      decoding="async"
      className={`w-full rounded-[40px] bg-[#D7E2EA]/5 object-cover sm:rounded-[50px] md:rounded-[60px] ${className}`}
      style={{ objectPosition: image.position ?? 'center', ...style }}
    />
  );
}
