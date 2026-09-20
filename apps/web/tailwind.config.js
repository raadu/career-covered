/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Single source of truth for the app's design tokens — see the
      // approved style tile (Phase 0). Change a value here, not in a
      // component: everything consuming the token name picks it up.
      colors: {
        brand: {
          50: '#EFF7F6', 100: '#D7EBE9', 200: '#AFD7D3', 300: '#7DBCB6',
          400: '#4B9D96', 500: '#2D7F78', 600: '#0F6E68', 700: '#0C5852',
          800: '#0A433F', 900: '#072E2B', 950: '#041B19',
        },
        neutral: {
          50: '#F7F9F9', 100: '#EEF2F1', 200: '#DCE3E2', 300: '#BFC9C8',
          400: '#98A5A3', 500: '#758482', 600: '#5A6968', 700: '#45514F',
          800: '#2E3736', 900: '#1C2322', 950: '#101514',
        },
        success: {
          DEFAULT: '#1F8A5F',
          hover: '#186E4C',
          fg: '#186E4C',
          'fg-dark': '#5FD79B',
          subtle: '#E6F6EE',
          'subtle-dark': '#123D2B',
          border: '#B7E4CB',
          'border-dark': '#1F5A3E',
        },
        danger: {
          DEFAULT: '#C4432E',
          hover: '#A03623',
          fg: '#A03623',
          'fg-dark': '#F1917C',
          subtle: '#FBEAE6',
          'subtle-dark': '#3A1912',
          border: '#F0C4B9',
          'border-dark': '#5C2A1C',
        },
        warning: {
          DEFAULT: '#B8791E',
          hover: '#946118',
          fg: '#946118',
          'fg-dark': '#E8B45C',
          subtle: '#FBF0DD',
          'subtle-dark': '#3A2A10',
          border: '#EAD1A0',
          'border-dark': '#5C441C',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"IBM Plex Serif"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.4' }],  // 11px — smallest permitted, e.g. table meta
        xs: ['0.75rem', { lineHeight: '1.5' }],        // 12px
        sm: ['0.8125rem', { lineHeight: '1.5' }],      // 13px
        base: ['0.9375rem', { lineHeight: '1.55' }],   // 15px
        lg: ['1.0625rem', { lineHeight: '1.6' }],      // 17px — used for serif letter body
        xl: ['1.25rem', { lineHeight: '1.3' }],        // 20px
        '2xl': ['1.5rem', { lineHeight: '1.25' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '1.2' }],    // 30px
        '4xl': ['2.25rem', { lineHeight: '1.15' }],    // 36px
      },
      // Radius removed as a variable, not just defaulted to it — every tier
      // resolves to 0 so accidentally reaching for rounded-lg etc. can't
      // reintroduce rounded corners. `full` stays for genuinely circular
      // elements (avatars), which are a different shape, not a "corner."
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '9999px',
      },
      spacing: {
        'icon-btn': '0.5rem',   // 8px
        gutter: '0.75rem',      // 12px
        card: '1rem',           // 16px
        section: '1.5rem',      // 24px
        modal: '2rem',          // 32px
      },
    },
  },
  plugins: [],
}
