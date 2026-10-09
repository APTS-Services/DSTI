/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      /**
       * GIGW colour palette.
       *
       * GIGW 3.0 (Guidelines for Indian Government Websites and Apps) does not
       * prescribe a literal palette, but it requires a *consistent look and feel*
       * and WCAG 2.1 AA readability. For colour it points to the UX4G / DBIM
       * (Digital Brand Identity) design system, whose tokens are reproduced here
       * verbatim. Every ramp below therefore comes from the official government
       * design system rather than a bespoke scheme.
       *
       *   primary   — UX4G "Brand Purple"  (headers, primary actions, links, focus)
       *   secondary — UX4G "Warm Amber"    (secondary accents / highlights, i.e. saffron)
       *   tertiary  — UX4G "Soft Purple"   (supporting brand accent)
       *   neutral   — UX4G neutral scale   (surfaces, text, borders; light + dark)
       *   success / warning / danger / info — UX4G semantic state colours
       *
       * Contrast: text pairings used in this app were verified against
       * WCAG 2.1 AA (4.5:1 normal text, 3:1 large text / UI). See index.css for
       * the semantic utility classes that lock the accessible pairings in.
       */
      colors: {
        primary: {
          50: '#f2efff',
          100: '#dcd4ff',
          200: '#c0b3ff',
          300: '#a391ff',
          400: '#8670ff',
          500: '#6a4eff',
          600: '#4a2bc2',
          700: '#3d239f',
          800: '#301c7d',
          900: '#24145c',
          950: '#1a0e3d',
        },
        secondary: {
          50: '#fff5ea',
          100: '#ffebd6',
          200: '#ffd9af',
          300: '#ffbe6f',
          400: '#e89c30',
          500: '#c47d00',
          600: '#a46800',
          700: '#764a00',
          800: '#4b2d00',
          900: '#281600',
          950: '#110700',
        },
        tertiary: {
          50: '#f6effb',
          100: '#e9daf3',
          200: '#d9bfea',
          300: '#c8a3e0',
          400: '#b686d6',
          500: '#a66acc',
          600: '#8e55b3',
          700: '#75419a',
          800: '#5d2f80',
          900: '#462166',
          950: '#32174a',
        },
        neutral: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d9d9d9',
          400: '#a1a1a1',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
          1000: '#000000',
        },
        success: {
          50: '#f2fcef',
          100: '#ddf8d8',
          200: '#beefbb',
          300: '#80da88',
          400: '#44c265',
          500: '#1aa64a',
          600: '#128937',
          700: '#006c35',
          800: '#00522c',
          900: '#00381f',
          950: '#002110',
        },
        warning: {
          50: '#fff7e6',
          100: '#ffe7bf',
          200: '#ffd899',
          300: '#ffc973',
          400: '#ffba4d',
          500: '#ffab27',
          600: '#fa8c16',
          700: '#d46b08',
          800: '#ad4e00',
          900: '#873800',
          950: '#612500',
        },
        danger: {
          50: '#fff8f8',
          100: '#ffecee',
          200: '#ffdadc',
          300: '#ffb3ae',
          400: '#ff8983',
          500: '#f55e57',
          600: '#db372d',
          700: '#b3251e',
          800: '#8a1a16',
          900: '#60150f',
          950: '#3a0907',
        },
        info: {
          50: '#e6fffb',
          100: '#c9f7f2',
          200: '#adf0e9',
          300: '#91e8e0',
          400: '#75e0d7',
          500: '#59d8ce',
          600: '#13c2c2',
          700: '#08979c',
          800: '#006d75',
          900: '#00474f',
          950: '#002329',
        },
        blue: {
          50: '#f5faff',
          100: '#e7f2ff',
          200: '#d0e4ff',
          300: '#a1c9ff',
          400: '#76acff',
          500: '#4e8ff8',
          600: '#3271ea',
          700: '#1157ce',
          800: '#04409f',
          900: '#012c6f',
          950: '#001944',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Telugu', 'system-ui', 'sans-serif'],
        telugu: ['"Noto Sans Telugu"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(23, 23, 23, 0.08), 0 6px 20px -12px rgba(36, 20, 92, 0.25)',
        'card-hover': '0 8px 30px -12px rgba(36, 20, 92, 0.35)',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        ticker: 'ticker 32s linear infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};
