import PublicLayout from '@/components/PublicLayout';
import { biographyService } from '../services/biography-service';
import type { BiographySection } from '../types/biography';

export const revalidate = 0;

function BiographyHeading({ section }: { section: BiographySection }) {
  const classNameByLevel = {
    large: 'font-serif-editorial text-3xl lg:text-4xl text-ink font-normal pt-2',
    medium: 'font-serif-editorial text-2xl lg:text-3xl text-accent font-normal pt-2',
    small: 'font-serif-editorial text-xl lg:text-2xl text-accent/90 font-normal pt-2',
  } as const;

  const className = classNameByLevel[section.headingLevel];

  if (section.headingLevel === 'large') {
    return <h2 className={className}>{section.subtitle}</h2>;
  }

  if (section.headingLevel === 'medium') {
    return <h3 className={className}>{section.subtitle}</h3>;
  }

  return <h4 className={className}>{section.subtitle}</h4>;
}

function BiographyBody({ bodyText }: { bodyText: string }) {
  return (
    <div className="space-y-4 text-ink/80 font-light leading-relaxed">
      {bodyText.split(/\n\s*\n/).map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export default async function BiographyPage() {
  const sections = await biographyService.getPublishedSections();

  return (
    <PublicLayout>
      <div className="max-w-3xl space-y-10 lg:space-y-14">
        <div className="space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-accent">
            Trayectoria y Formación
          </span>
          <h1 className="font-serif-editorial text-3xl lg:text-5xl tracking-editorial text-ink font-normal leading-tight">
            Biografía
          </h1>
          <div className="w-16 h-0.5 bg-accent/60" />
        </div>

        <div className="space-y-10 border-t border-line pt-8 lg:space-y-14">
          {sections.map((section) => (
            <section key={section.id} className="space-y-4">
              {section.subtitle && <BiographyHeading section={section} />}
              <BiographyBody bodyText={section.bodyText} />
            </section>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
