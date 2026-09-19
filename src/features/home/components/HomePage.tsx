import Link from 'next/link';

import PublicLayout from '@/components/PublicLayout';
import { RichText } from '@/shared/ui';

import { getHomeManifesto } from '../services/get-home-manifesto';

export default async function HomePage() {
  const manifesto = await getHomeManifesto();

  return (
    <PublicLayout>
      <div className="max-w-4xl space-y-12 lg:space-y-16">
        <div className="space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-accent">
            Puerta de Entrada · Artist Statement
          </span>
          <h2 className="font-serif-editorial text-3xl lg:text-5xl tracking-editorial text-ink font-normal leading-tight">
            Manifiesto
          </h2>
          <div className="w-16 h-0.5 bg-accent/60" />
        </div>

        <RichText className="max-w-none space-y-6 text-ink/90 font-sans text-base lg:text-lg leading-relaxed">
          {manifesto.statementText.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h3 key={index} className="font-serif-editorial text-2xl lg:text-3xl text-ink font-normal pt-4">
                  {paragraph.replace('## ', '')}
                </h3>
              );
            }

            return (
              <p key={index} className="text-ink/80 leading-relaxed font-light">
                {paragraph}
              </p>
            );
          })}
        </RichText>

        {(manifesto.imageUrl1 || manifesto.imageUrl2) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-line/60">
            {manifesto.imageUrl1 && (
              <div className="space-y-2">
                <div className="overflow-hidden rounded border border-line bg-surface">
                  <img
                    src={manifesto.imageUrl1}
                    alt="Textura Manifiesto I"
                    className="w-full h-80 lg:h-96 object-cover hover:scale-105 transition duration-700 opacity-90 hover:opacity-100"
                  />
                </div>
                <span className="text-xs font-mono text-ink-muted block text-right">
                  Detalle de textura y pigmento I
                </span>
              </div>
            )}

            {manifesto.imageUrl2 && (
              <div className="space-y-2">
                <div className="overflow-hidden rounded border border-line bg-surface">
                  <img
                    src={manifesto.imageUrl2}
                    alt="Textura Manifiesto II"
                    className="w-full h-80 lg:h-96 object-cover hover:scale-105 transition duration-700 opacity-90 hover:opacity-100"
                  />
                </div>
                <span className="text-xs font-mono text-ink-muted block text-right">
                  Detalle de textura y pigmento II
                </span>
              </div>
            )}
          </div>
        )}

        <div className="pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="font-cursive-gestual text-2xl text-ink-muted italic">
            "Explorar el cuerpo de obra completo"
          </div>
          <Link
            href="/series"
            className="w-full sm:w-auto px-8 py-4 bg-surface border border-accent text-ink font-serif-editorial text-lg tracking-wide rounded hover:bg-accent hover:text-accent-contrast transition text-center"
          >
            Ver Series y Obras →
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
