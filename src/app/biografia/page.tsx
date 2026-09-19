import PublicLayout from '@/components/PublicLayout';
import { getBio } from '@/lib/db';

export const revalidate = 0;

export default async function BioPage() {
  const bio = await getBio();

  return (
    <PublicLayout>
      <div className="max-w-3xl space-y-10 lg:space-y-14">
        {/* Header */}
        <div className="space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-patagonia-accent">
            Trayectoria y Formación
          </span>
          <h1 className="font-serif-editorial text-3xl lg:text-5xl tracking-editorial text-patagonia-fg font-normal leading-tight">
            Biografía / CV
          </h1>
          <div className="w-16 h-0.5 bg-patagonia-accent/60"></div>
        </div>

        {/* Bio text rendering */}
        <div className="prose prose-invert max-w-none space-y-6 text-patagonia-fg/90 font-sans text-base lg:text-lg leading-relaxed border-t border-patagonia-border pt-8">
          {bio.bioText.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('# ')) {
              return (
                <h2 key={index} className="font-serif-editorial text-3xl lg:text-4xl text-patagonia-fg font-normal pt-2">
                  {paragraph.replace('# ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={index} className="font-serif-editorial text-2xl text-patagonia-accent font-normal pt-4 border-b border-patagonia-border/40 pb-2">
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
                        <div key={lIdx} className="flex items-start gap-3 text-patagonia-fg/80 font-light text-base">
                          <span className="text-patagonia-accent font-mono">•</span>
                          <span>{line.replace('- ', '')}</span>
                        </div>
                      );
                    }
                    return <p key={lIdx} className="text-patagonia-muted italic text-sm">{line}</p>;
                  })}
                </div>
              );
            }
            return (
              <p key={index} className="text-patagonia-fg/80 font-light leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
}
