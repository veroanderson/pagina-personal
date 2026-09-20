import Image from 'next/image';
import type { HomeContent } from '../types/home';

export function HomeHero({ content }: { content: HomeContent }) {
  return (
    <section className="relative isolate h-full min-h-0 overflow-hidden bg-canvas text-white">
      <Image src={content.imageSrc} alt={content.imageAlt} fill priority sizes="(min-width: 1024px) calc(100vw - 20rem), 100vw" className="object-cover object-center" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-black/10 to-black/20" />
      <div className="relative z-10 flex h-full min-h-0 items-start px-6 pb-16 pt-10 sm:px-10 sm:pt-14 lg:px-16 lg:pt-16">
        <div className="max-w-xl">
          <p className="mb-5 text-xs font-mono uppercase tracking-[0.24em] text-white/80 sm:text-sm">{content.eyebrow}</p>
          <h1 className="max-w-lg font-serif-editorial text-4xl font-normal leading-[1.05] tracking-editorial sm:text-6xl lg:text-7xl">{content.title}</h1>
        </div>
      </div>
    </section>
  );
}
