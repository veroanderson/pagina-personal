/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tinted neutrals - Patagonia Cold Editorial palette
        patagonia: {
          bg: '#0b0f19',         // Fondo principal con 4% tinte azul/verde frío
          panel: '#121824',      // Superficie de panel continuo
          hover: '#192233',      // Superficie hover sutil
          border: '#232f45',     // Bordes tenues (divide-y)
          muted: '#8c9cb8',      // Texto secundario desaturado
          fg: '#e4e9f2',         // Texto principal (blanco lino tenue)
          accent: '#4a7c82',     // Verde frío patagónico
          bordo: '#6b303b',      // Bordó frío desaturado para detalles/badges
          earth: '#5c5248',      // Tierra desaturado
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Cormorant Garamond', 'Georgia', 'serif'],
        cursive: ['var(--font-cursive)', 'Caveat', 'cursive'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.25em',
        editorial: '0.15em',
      }
    },
  },
  plugins: [],
}
