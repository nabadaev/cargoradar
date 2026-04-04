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
        white:  '#ffffff',
        off:    '#f7f6f4',
        ink:    '#0d0d0d',
        'ink-2':'#1a1a1a',
        muted:  '#6e6e6e',
        rule:   '#d8d8d4',
        red:    '#c0392b',
        amber:  '#b8680a',
        green:  '#1a6b3a',
      },
      fontFamily: {
        mono: ['Geist Mono', 'monospace'],
        sans: ['Instrument Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
