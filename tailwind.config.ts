import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b1220',
        panel: '#111c33',
        panelSoft: '#17233f',
        border: '#243659',
        text: '#d9e6ff',
        muted: '#8aa0c8',
        accent: '#4dd0a9',
        accent2: '#4da4ff',
        warning: '#ffb547'
      }
    }
  },
  plugins: []
};

export default config;
