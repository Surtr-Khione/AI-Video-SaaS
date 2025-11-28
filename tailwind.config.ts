import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        timeline: {
          bg: '#1a1a1a',
          track: '#2a2a2a',
          clip: {
            video: '#4a90e2',
            audio: '#50c878',
          },
          ruler: '#3a3a3a',
          playhead: '#ff4444',
        }
      }
    },
  },
  plugins: [],
}
export default config
