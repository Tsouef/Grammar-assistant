import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: [
    'src/background/index.ts',
    'src/content/index.tsx',
    'src/popup/popup.tsx',
  ],
  project: ['src/**/*.{ts,tsx}'],
}

export default config
