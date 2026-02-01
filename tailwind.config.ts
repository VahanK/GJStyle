import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PRIMARY BRAND COLOR (placeholder - will be replaced with final branding)
        brand: {
          50: '#FDFAF6',
          100: '#FAF4ED',
          200: '#F5E8DB',
          300: '#EBCFB4',
          400: '#DDB388',
          500: '#D4AF37', // Main gold
          600: '#B8941F',
          700: '#8A6E17',
          800: '#5C4910',
          900: '#2E2408',
          950: '#171204',
        },
        // NEUTRALS
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        // FUNCTIONAL COLORS
        whatsapp: '#25D366',
        instagram: '#E4405F',
        dhl: '#FFCC00',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        logo: ['Playfair Display', 'serif'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      spacing: {
        'section-sm': '4rem',
        'section-md': '6rem',
        'section-lg': '8rem',
        'section-xl': '10rem',
      },
      maxWidth: {
        content: '65ch',
        prose: '75ch',
        container: '1400px',
      },
    },
  },
  plugins: [],
}

export default config
