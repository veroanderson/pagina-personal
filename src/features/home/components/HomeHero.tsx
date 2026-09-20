import Image from 'next/image';
import type { HomeContent } from '../types/home';

export function HomeHero({ content }: { content: HomeContent }) {
  const positionClasses = {
    'top-left': 'items-start justify-start pt-24 text-left',
    'top-right': 'items-start justify-end pt-24 text-right',
    'bottom-left': 'items-end justify-start pb-16 text-left',
    'bottom-right': 'items-end justify-end pb-16 text-right',
  }[content.titlePosition];

  return (
    <section className="relative isolate h-full min-h-0 overflow-hidden bg-canvas text-white">
      <Image src={content.imageSrc} alt={content.imageAlt} fill priority sizes="(min-width: 1024px) calc(100vw - 20rem), 100vw" className="object-cover object-center" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-black/10 to-black/20" />
      <div className="absolute left-6 top-10 z-10 max-w-xl sm:left-10 sm:top-14 lg:left-16 lg:top-16">
        <p className="text-xs font-mono uppercase tracking-[0.24em] text-white/80 sm:text-sm">{content.eyebrow}</p>
      </div>
      <div className={`relative z-10 flex h-full min-h-0 px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16 ${positionClasses}`}>
        <h1 className="max-w-lg font-serif-editorial text-4xl font-normal leading-[1.05] tracking-editorial sm:text-6xl lg:text-7xl">{content.title}</h1>
      </div>
    </section>
  );
}
