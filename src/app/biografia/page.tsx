import PublicLayout from '@/components/PublicLayout';
import { getBio } from '@/lib/db';
import { RichText } from '@/shared/ui';

export const revalidate = 0;

export default async function BioPage() {
  const bio = await getBio();

  return (
    <PublicLayout>
      <div className="max-w-3xl space-y-10 lg:space-y-14">
        {/* Header */}
        <div className="space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-accent">
            Trayectoria y Formación
          </span>
          <h1 className="font-serif-editorial text-3xl lg:text-5xl tracking-editorial text-ink font-normal leading-tight">
            Biografía / CV
          </h1>
          <div className="w-16 h-0.5 bg-accent/60"></div>
        </div>

        {/* Bio text rendering */}
        <RichText className="max-w-none space-y-6 text-ink/90 font-sans text-base lg:text-lg leading-relaxed border-t border-line pt-8">
          {bio.bioText.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('# ')) {
              return (
                <h2 key={index} className="font-serif-editorial text-3xl lg:text-4xl text-ink font-normal pt-2">
                  {paragraph.replace('# ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={index} className="font-serif-editorial text-2xl text-accent font-normal pt-4 border-b border-line/40 pb-2">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.includes('\n- ')) {
              const lines = paragraph.split('\n');
              return (
                <div key={index} className="space-y-2">
                  {lines.map((line, lIdx) => {
                    if (line.startsWith('- ')) {
                      return (
                        <div key={lIdx} className="flex items-start gap-3 text-ink/80 font-light text-base">
                          <span className="text-accent font-mono">•</span>
                          <span>{line.replace('- ', '')}</span>
                        </div>
                      );
                    }
                    return <p key={lIdx} className="text-ink-muted italic text-sm">{line}</p>;
                  })}
                </div>
              );
            }
            return (
              <p key={index} className="text-ink/80 font-light leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </RichText>
      </div>
    </PublicLayout>
  );
}
