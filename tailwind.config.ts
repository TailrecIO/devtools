import { skeleton } from '@skeletonlabs/tw-plugin';
import { join } from 'path';
import { createRequire } from 'module';
import type { Config } from 'tailwindcss';

const require = createRequire(import.meta.url);

const config = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,svelte,ts}',
    join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
  ],
  theme: {
    extend: {}
  },
  plugins: [
    skeleton({
      themes: {
        preset: [
          {
            name: 'skeleton',
            enhancements: true
          }
        ]
      }
    })
  ]
} satisfies Config;

export default config;
