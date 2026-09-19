import type { Metadata } from 'next';
import { Cormorant_Garamond, Caveat, Inter } from 'next/font/google';
import { ThemeProvider, ThemeScript } from '@/features/theme';
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fontSerif.variable} ${fontCursive.variable} ${fontSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="bg-canvas text-ink antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
