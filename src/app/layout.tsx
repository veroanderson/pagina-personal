import type { Metadata } from 'next';
import { Cormorant_Garamond, Caveat, Inter } from 'next/font/google';
import './globals.css';

const fontSerif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
});
const fontCursive = Caveat({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cursive',
});
const fontSans = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Vero Anderson | Artista Visual · Portfolio',
  description: 'Portfolio de la artista visual Vero Anderson. Obras, series, manifiesto y biografía.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fontSerif.variable} ${fontCursive.variable} ${fontSans.variable}`}>
      <body className="bg-patagonia-bg text-patagonia-fg antialiased selection:bg-patagonia-accent/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
